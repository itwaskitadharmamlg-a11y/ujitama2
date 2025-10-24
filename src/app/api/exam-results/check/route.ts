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

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromToken(request)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')

    if (!examId) {
      return NextResponse.json(
        { error: 'Exam ID is required' },
        { status: 400 }
      )
    }

    const examResult = await db.examResult.findFirst({
      where: {
        examId,
        studentId: userData.userId
      },
      include: {
        answers: {
          select: {
            questionId: true,
            answer: true
          }
        }
      }
    })

    if (!examResult) {
      return NextResponse.json({ status: 'NOT_FOUND' })
    }

    return NextResponse.json(examResult)
  } catch (error) {
    console.error('Error checking exam result:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa hasil ujian' },
      { status: 500 }
    )
  }
}