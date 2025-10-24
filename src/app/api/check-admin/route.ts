import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if admin user exists
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (adminUser) {
      return NextResponse.json({
        exists: true,
        admin: adminUser
      })
    } else {
      return NextResponse.json({
        exists: false,
        message: 'Admin user not found'
      })
    }
  } catch (error) {
    console.error('Error checking admin user:', error)
    return NextResponse.json(
      { error: 'Failed to check admin user' },
      { status: 500 }
    )
  }
}