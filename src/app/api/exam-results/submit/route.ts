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

    // Get exam result with questions
    const examResult = await db.examResult.findUnique({
      where: { id: resultId },
      include: {
        exam: {
          include: {
            questions: true
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

    // Delete existing answers
    await db.answer.deleteMany({
      where: { resultId }
    })

    let totalScore = 0
    let maxScore = 0

    // Process each answer
    for (const answer of answers) {
      const question = examResult.exam.questions.find(q => q.id === answer.questionId)
      if (!question) continue

      maxScore += question.maxScore

      let isCorrect = false
      let score = 0

      if (question.type === 'MULTIPLE_CHOICE') {
        isCorrect = answer.answer === question.correctAnswer
        score = isCorrect ? question.maxScore : 0
      } else if (question.type === 'ESSAY') {
        // Essay questions need manual grading
        score = 0
      }

      totalScore += score

      // Create answer record
      await db.answer.create({
        data: {
          resultId,
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect,
          score
        }
      })
    }

    // Update exam result
    const updatedResult = await db.examResult.update({
      where: { id: resultId },
      data: {
        status: 'COMPLETED',
        score: totalScore,
        maxScore,
        finishedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Exam submitted successfully',
      id: updatedResult.id
    })
  } catch (error) {
    console.error('Error submitting exam:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengumpulkan ujian' },
      { status: 500 }
    )
  }
}