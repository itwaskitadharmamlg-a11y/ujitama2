import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id
    const body = await request.json()
    
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

    // Handle different update types
    let updateData: any = {}
    
    if (typeof body.isActive === 'boolean') {
      // Simple activation toggle
      updateData = { isActive: body.isActive }
    } else {
      // Full exam update
      const { title, description, duration, startTime, endTime, classId } = body
      
      // Validasi input
      if (!title || !duration || !startTime || !endTime || !classId) {
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

      updateData = {
        title,
        description,
        duration,
        startTime: start,
        endTime: end,
        classId
      }
    }

    // Update exam
    const updatedExam = await db.exam.update({
      where: { id: examId },
      data: updateData,
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
      message: 'Ujian berhasil diperbarui',
      exam: updatedExam
    })
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate ujian' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id

    // Check if exam exists
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        _count: {
          select: {
            results: true
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if exam has results
    if (exam._count.results > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus ujian yang sudah memiliki hasil' },
        { status: 400 }
      )
    }

    // Delete exam (cascade will delete questions)
    await db.exam.delete({
      where: { id: examId }
    })

    return NextResponse.json({
      message: 'Ujian berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus ujian' },
      { status: 500 }
    )
  }
}