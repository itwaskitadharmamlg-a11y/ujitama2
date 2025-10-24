import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromToken(request)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { resultId, answers } = await request.json()

    if (!resultId || !answers) {
      return NextResponse.json(
        { error: 'Result ID and answers are required' },
        { status: 400 }
      )
    }

    // Delete existing answers for this result
    await db.answer.deleteMany({
      where: { resultId }
    })

    // Create new answers
    for (const answer of answers) {
      await db.answer.create({
        data: {
          resultId,
          questionId: answer.questionId,
          answer: answer.answer
        }
      })
    }

    return NextResponse.json({
      message: 'Answers saved successfully'
    })
  } catch (error) {
    console.error('Error saving answers:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan jawaban' },
      { status: 500 }
    )
  }
}