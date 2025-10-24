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

    const { examId, studentId } = await request.json()

    if (!examId || !studentId) {
      return NextResponse.json(
        { error: 'Exam ID and Student ID are required' },
        { status: 400 }
      )
    }

    // Create exam result
    const examResult = await db.examResult.create({
      data: {
        examId,
        studentId,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Exam started successfully',
      id: examResult.id
    })
  } catch (error) {
    console.error('Error starting exam:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memulai ujian' },
      { status: 500 }
    )
  }
}