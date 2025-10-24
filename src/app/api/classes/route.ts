import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programStudi = searchParams.get('programStudi')

    let whereClause: any = {}

    if (programStudi) {
      whereClause.programStudi = programStudi
    }

    const classes = await db.class.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            students: true,
            exams: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data kelas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, programStudi, description, createdBy } = await request.json()

    // Validasi input
    if (!name || !programStudi || !createdBy) {
      return NextResponse.json(
        { error: 'Nama, program studi, dan pembuat harus diisi' },
        { status: 400 }
      )
    }

    // Check if creator exists and has appropriate role
    const creator = await db.user.findUnique({
      where: { id: createdBy }
    })

    if (!creator || (creator.role !== 'LECTURER' && creator.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Pembuat kelas tidak valid' },
        { status: 403 }
      )
    }

    // Create class
    const newClass = await db.class.create({
      data: {
        name,
        programStudi,
        description,
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
        _count: {
          select: {
            students: true,
            exams: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Kelas berhasil dibuat',
      class: newClass
    })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Gagal membuat kelas' },
      { status: 500 }
    )
  }
}