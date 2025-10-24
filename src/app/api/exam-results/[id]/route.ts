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

export async function GET(
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

    const examResult = await db.examResult.findUnique({
      where: { id: params.id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            nim: true
          }
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            answer: true,
            isCorrect: true,
            score: true
          }
        },
        feedbacks: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!examResult) {
      return NextResponse.json(
        { error: 'Exam result not found' },
        { status: 404 }
      )
    }

    // Check if user owns this result or is lecturer/admin
    if (examResult.studentId !== userData.userId && 
        userData.role !== 'LECTURER' && 
        userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(examResult)
  } catch (error) {
    console.error('Error fetching exam result:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data hasil ujian' },
      { status: 500 }
    )
  }
}