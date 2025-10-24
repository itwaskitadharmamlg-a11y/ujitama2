import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { nim, username, password, role } = await request.json()

    // Validasi input
    if (!password || !role) {
      return NextResponse.json(
        { error: 'Password dan role harus diisi' },
        { status: 400 }
      )
    }

    // Cari user berdasarkan role dan identifier
    let user
    if (role === 'STUDENT') {
      if (!nim) {
        return NextResponse.json(
          { error: 'NIM harus diisi untuk login mahasiswa' },
          { status: 400 }
        )
      }
      
      user = await db.user.findUnique({
        where: { nim }
      })
    } else if (role === 'LECTURER' || role === 'ADMIN') {
      if (!username) {
        return NextResponse.json(
          { error: 'Username harus diisi untuk login dosen/admin' },
          { status: 400 }
        )
      }
      
      user = await db.user.findUnique({
        where: { username }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    // Verifikasi role
    if (user.role !== role) {
      return NextResponse.json(
        { error: 'Role tidak sesuai' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login berhasil',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}