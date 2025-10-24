import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Create admin user if not exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Alibersaudara124*', 10)
      await db.user.create({
        data: {
          name: 'Ali',
          username: 'Ali',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
    }

    // Create a sample lecturer if not exists
    const existingLecturer = await db.user.findFirst({
      where: { role: 'LECTURER' }
    })

    if (!existingLecturer) {
      const hashedPassword = await bcrypt.hash('password123', 10)
      await db.user.create({
        data: {
          name: 'Dr. Budi Santoso',
          username: 'budi.santoso',
          password: hashedPassword,
          role: 'LECTURER'
        }
      })
    }

    // Create a sample class if not exists
    const existingClass = await db.class.findFirst()
    
    if (!existingClass) {
      const lecturer = await db.user.findFirst({
        where: { role: 'LECTURER' }
      })

      if (lecturer) {
        await db.class.create({
          data: {
            name: 'TI-1A',
            programStudi: 'S1 Teknologi Informasi',
            description: 'Kelas Teknologi Informasi Semester 1',
            createdBy: lecturer.id
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Data seed berhasil ditambahkan'
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Gagal menambahkan data seed' },
      { status: 500 }
    )
  }
}