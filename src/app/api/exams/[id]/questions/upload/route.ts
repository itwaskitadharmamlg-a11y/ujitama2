import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if exam exists
    const exam = await db.exam.findUnique({
      where: { id: examId }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'File tidak valid atau kosong' },
        { status: 400 }
      )
    }

    // Parse CSV (skip header)
    const questions = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV parsing (assuming no commas in the content)
      const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''))
      
      if (parts.length >= 9) {
        const [question, type, optionA, optionB, optionC, optionD, optionE, correctAnswer, maxScore] = parts
        
        if (question && type && (type === 'MULTIPLE_CHOICE' || type === 'ESSAY')) {
          questions.push({
            question,
            type,
            options: type === 'MULTIPLE_CHOICE' ? [optionA, optionB, optionC, optionD, optionE].filter(opt => opt) : [],
            correctAnswer: type === 'MULTIPLE_CHOICE' ? correctAnswer : '',
            maxScore: parseInt(maxScore) || 1,
            examId
          })
        }
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada soal valid yang ditemukan dalam file' },
        { status: 400 }
      )
    }

    // Insert questions to database
    await db.question.createMany({
      data: questions
    })

    return NextResponse.json({
      message: `Berhasil mengunggah ${questions.length} soal`,
      questionsUploaded: questions.length
    })
  } catch (error) {
    console.error('Error uploading questions:', error)
    return NextResponse.json(
      { error: 'Gagal mengunggah soal' },
      { status: 500 }
    )
  }
}