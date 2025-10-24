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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromToken(request)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if exam result exists and user has access
    const examResult = await db.examResult.findUnique({
      where: { id: params.id },
      select: {
        studentId: true,
        status: true
      }
    })

    if (!examResult) {
      return NextResponse.json(
        { error: 'Exam result not found' },
        { status: 404 }
      )
    }

    // Check if user has access (student who owns the result, or lecturer/admin)
    if (examResult.studentId !== userData.userId && 
        userData.role !== 'LECTURER' && 
        userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only allow feedback on completed exams
    if (examResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Feedback can only be added to completed exams' },
        { status: 400 }
      )
    }

    // Create feedback
    const feedback = await db.feedback.create({
      data: {
        resultId: params.id,
        authorId: userData.userId,
        content: content.trim()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Feedback added successfully',
      feedback
    })
  } catch (error) {
    console.error('Error adding feedback:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambah feedback' },
      { status: 500 }
    )
  }
}