'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, User, Lock, GraduationCap, Users, Shield, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    nim: '',
    password: ''
  })
  const [lecturerLoginData, setLecturerLoginData] = useState({
    username: '',
    password: ''
  })
  const [adminLoginData, setAdminLoginData] = useState({
    username: '',
    password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    student: false,
    lecturer: false,
    admin: false
  })
  const router = useRouter()

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...loginData,
          role: 'STUDENT'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        // Redirect to student dashboard
        router.push('/dashboard/student')
      } else {
        alert(data.error || 'Login gagal')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLecturerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...lecturerLoginData,
          role: 'LECTURER'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        // Redirect to lecturer dashboard
        router.push('/dashboard/lecturer')
      } else {
        alert(data.error || 'Login gagal')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adminLoginData,
          role: 'ADMIN'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        // Redirect to lecturer dashboard (admin uses same dashboard)
        router.push('/dashboard/lecturer')
      } else {
        alert(data.error || 'Login gagal')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12">
              <img
                src="https://iili.io/KgEBP7s.png"
                alt="Universitas Waskita Dharma"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-slate-900">
                UNIVERSITAS WASKITA DHARMA
              </h1>
              <p className="text-xs text-slate-600">
                Values of Knowledge Skills & Attitude
              </p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Login Sistem Ujian</h2>
        </div>

        {/* Login Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-slate-900">Masuk ke Akun Anda</CardTitle>
            <CardDescription className="text-center text-slate-600">
              Pilih jenis login sesuai dengan peran Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Mahasiswa
                </TabsTrigger>
                <TabsTrigger value="lecturer" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Dosen
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nim">NIM</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="nim"
                        type="text"
                        placeholder="Masukkan NIM"
                        className="pl-10"
                        value={loginData.nim}
                        onChange={(e) => setLoginData({ ...loginData, nim: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPasswords.student ? "text" : "password"}
                        placeholder="Masukkan kata sandi"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, student: !showPasswords.student })}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.student ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memproses...' : 'Login sebagai Mahasiswa'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="lecturer" className="space-y-4">
                <form onSubmit={handleLecturerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lecturerUsername">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="lecturerUsername"
                        type="text"
                        placeholder="Masukkan username"
                        className="pl-10"
                        value={lecturerLoginData.username}
                        onChange={(e) => setLecturerLoginData({ ...lecturerLoginData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturerPassword">Kata Sandi</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="lecturerPassword"
                        type={showPasswords.lecturer ? "text" : "password"}
                        placeholder="Masukkan kata sandi"
                        className="pl-10 pr-10"
                        value={lecturerLoginData.password}
                        onChange={(e) => setLecturerLoginData({ ...lecturerLoginData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, lecturer: !showPasswords.lecturer })}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.lecturer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memproses...' : 'Login sebagai Dosen'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="adminUsername"
                        type="text"
                        placeholder="Masukkan username admin"
                        className="pl-10"
                        value={adminLoginData.username}
                        onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Kata Sandi</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="adminPassword"
                        type={showPasswords.admin ? "text" : "password"}
                        placeholder="Masukkan kata sandi admin"
                        className="pl-10 pr-10"
                        value={adminLoginData.password}
                        onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, admin: !showPasswords.admin })}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.admin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memproses...' : 'Login sebagai Administrator'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Belum punya akun?{' '}
                <Link href="/" className="text-blue-600 hover:underline">
                  Daftar sekarang
                </Link>
              </p>
              <div className="mt-4">
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-800 underline">
                  ← Kembali ke Beranda
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-600">Ujian Online</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-600">Aman & Terpercaya</p>
          </div>
        </div>
      </div>
    </div>
  )
}