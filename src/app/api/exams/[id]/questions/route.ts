import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questions = await db.question.findMany({
      where: { examId: params.id },
      orderBy: { createdAt: 'asc' }
    })

    // Parse options for multiple choice questions
    const formattedQuestions = questions.map(question => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : []
    }))

    return NextResponse.json(formattedQuestions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data soal' },
      { status: 500 }
    )
  }
}