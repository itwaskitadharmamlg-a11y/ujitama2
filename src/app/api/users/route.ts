import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const classId = searchParams.get('classId')

    let users
    
    if (role) {
      // Filter by role
      users = await db.user.findMany({
        where: { role },
        select: {
          id: true,
          name: true,
          username: true,
          nim: true,
          programStudi: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (classId) {
      // Get students in specific class
      users = await db.user.findMany({
        where: {
          role: 'STUDENT',
          classes: {
            some: {
              classId: classId
            }
          }
        },
        select: {
          id: true,
          name: true,
          nim: true,
          programStudi: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get all users
      users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          nim: true,
          programStudi: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengguna' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, username, nim, password, role, programStudi, classIds } = await request.json()

    // Validasi input
    if (!name || !password || !role) {
      return NextResponse.json(
        { error: 'Nama, password, dan role harus diisi' },
        { status: 400 }
      )
    }

    // Validasi role-specific fields
    if (role === 'STUDENT' && !nim) {
      return NextResponse.json(
        { error: 'NIM harus diisi untuk mahasiswa' },
        { status: 400 }
      )
    }

    if ((role === 'LECTURER' || role === 'ADMIN') && !username) {
      return NextResponse.json(
        { error: 'Username harus diisi untuk dosen/admin' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          ...(nim ? [{ nim }] : []),
          ...(username ? [{ username }] : [])
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Pengguna dengan NIM atau username tersebut sudah ada' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userData: any = {
      name,
      password: hashedPassword,
      role,
      ...(nim && { nim }),
      ...(username && { username }),
      ...(programStudi && { programStudi })
    }

    const user = await db.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        username: true,
        nim: true,
        programStudi: true,
        role: true,
        createdAt: true
      }
    })

    // Add to classes if provided
    if (classIds && classIds.length > 0 && role === 'STUDENT') {
      await db.classStudent.createMany({
        data: classIds.map((classId: string) => ({
          classId,
          studentId: user.id
        }))
      })
    }

    return NextResponse.json({
      message: 'Pengguna berhasil dibuat',
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengguna' },
      { status: 500 }
    )
  }
}