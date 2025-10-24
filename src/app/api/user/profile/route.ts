import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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

export async function PUT(request: NextRequest) {
  try {
    const userData = await getUserFromToken(request)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, nim, programStudi } = await request.json()

    // Validasi input
    if (!name || !nim || !programStudi) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah NIM sudah digunakan oleh user lain
    const existingUser = await db.user.findFirst({
      where: {
        nim,
        id: { not: userData.userId }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'NIM sudah digunakan oleh user lain' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await db.user.update({
      where: {
        id: userData.userId
      },
      data: {
        name,
        nim,
        programStudi
      }
    })

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    )
  }
}