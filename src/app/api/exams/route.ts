import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const createdBy = searchParams.get('createdBy')
    const isActive = searchParams.get('isActive')

    let whereClause: any = {}

    if (classId) {
      whereClause.classId = classId
    }

    if (createdBy) {
      whereClause.createdBy = createdBy
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }

    const exams = await db.exam.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            programStudi: true
          }
        },
        _count: {
          select: {
            questions: true,
            results: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data ujian' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, duration, startTime, endTime, classId, createdBy } = await request.json()

    // Validasi input
    if (!title || !duration || !startTime || !endTime || !classId || !createdBy) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start >= end) {
      return NextResponse.json(
        { error: 'Waktu mulai harus sebelum waktu selesai' },
        { status: 400 }
      )
    }

    // Check if creator exists and has appropriate role
    const creator = await db.user.findUnique({
      where: { id: createdBy }
    })

    if (!creator || (creator.role !== 'LECTURER' && creator.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Pembuat ujian tidak valid' },
        { status: 403 }
      )
    }

    // Check if class exists
    const classExists = await db.class.findUnique({
      where: { id: classId }
    })

    if (!classExists) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create exam
    const exam = await db.exam.create({
      data: {
        title,
        description,
        duration,
        startTime: start,
        endTime: end,
        classId,
        createdBy
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            programStudi: true
          }
        },
        _count: {
          select: {
            questions: true,
            results: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Ujian berhasil dibuat',
      exam
    })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { error: 'Gagal membuat ujian' },
      { status: 500 }
    )
  }
}