import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, nim, programStudi, password } = await request.json()

    // Validasi input
    if (!name || !nim || !programStudi || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah NIM sudah terdaftar
    const existingUser = await db.user.findUnique({
      where: { nim }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'NIM sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat user baru
    const user = await db.user.create({
      data: {
        name,
        nim,
        programStudi,
        password: hashedPassword,
        role: 'STUDENT'
      }
    })

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Akun berhasil dibuat',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    )
  }
}