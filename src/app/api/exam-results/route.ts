import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const examResults = await db.examResult.findMany({
      where: {
        studentId
      },
      include: {
        exam: {
          include: {
            class: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(examResults)
  } catch (error) {
    console.error('Error fetching exam results:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data hasil ujian' },
      { status: 500 }
    )
  }
}