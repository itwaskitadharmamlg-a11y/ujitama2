import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        admin: {
          username: existingAdmin.username,
          name: existingAdmin.name
        }
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Alibersaudara124*', 10)
    
    const admin = await db.user.create({
      data: {
        username: 'Ali',
        name: 'Administrator',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = admin

    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: adminWithoutPassword
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}