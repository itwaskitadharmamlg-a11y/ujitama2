'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Clock, PenTool, Award, Users, GraduationCap, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerData, setRegisterData] = useState({
    name: '',
    nim: '',
    programStudi: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setShowWelcome(true)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi
    if (!registerData.name || !registerData.nim || !registerData.programStudi || !registerData.password) {
      alert('Semua field harus diisi')
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('Password dan konfirmasi password harus sama')
      return
    }

    if (registerData.password.length < 6) {
      alert('Password minimal 6 karakter')
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          nim: registerData.nim,
          programStudi: registerData.programStudi,
          password: registerData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Pendaftaran berhasil! Silakan login dengan akun Anda.')
        setIsRegisterOpen(false)
        setRegisterData({
          name: '',
          nim: '',
          programStudi: '',
          password: '',
          confirmPassword: ''
        })
      } else {
        alert(data.error || 'Pendaftaran gagal')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Terjadi kesalahan saat mendaftar')
    } finally {
      setIsRegistering(false)
    }
  }

  const programStudiOptions = [
    'S1 Ilmu Administrasi Negara',
    'S1 Bisnis Digital',
    'S1 Ilmu Pertanian',
    'S1 Peternakan',
    'S1 Kimia',
    'S1 Teknologi Informasi',
    'S2 Magister Administrasi Publik'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 md:w-16 md:h-16">
              <img
                src="https://iili.io/KgEBP7s.png"
                alt="Universitas Waskita Dharma"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                UNIVERSITAS WASKITA DHARMA
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                Values of Knowledge Skills & Attitude
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className={`text-center mb-12 transition-all duration-1000 transform ${showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Selamat Datang Peserta Ujian
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Silahkan Daftar dan login untuk mengikuti ujian
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900">Sistem Ujian Terintegrasi</CardTitle>
                <CardDescription className="text-slate-600">
                  Platform ujian online yang komprehensif dan mudah digunakan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900">Pantau Waktu Real-time</CardTitle>
                <CardDescription className="text-slate-600">
                  Timer otomatis dan pengingat untuk pengalaman ujian yang terstruktur
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900">Hasil Instan</CardTitle>
                <CardDescription className="text-slate-600">
                  Lihat hasil ujian dan feedback langsung setelah selesai
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                <Users className="w-5 h-5 mr-2" />
                Login
              </Button>
            </Link>

            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Daftar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Daftar Akun Mahasiswa Baru</DialogTitle>
                  <DialogDescription>
                    Buat akun baru untuk mengakses sistem ujian
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input 
                      id="name" 
                      placeholder="Masukkan nama lengkap" 
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nim">NIM</Label>
                    <Input 
                      id="nim" 
                      placeholder="Masukkan NIM" 
                      value={registerData.nim}
                      onChange={(e) => setRegisterData({ ...registerData, nim: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="programStudi">Program Studi</Label>
                    <Select value={registerData.programStudi} onValueChange={(value) => setRegisterData({ ...registerData, programStudi: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program studi" />
                      </SelectTrigger>
                      <SelectContent>
                        {programStudiOptions.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Masukkan kata sandi" 
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="Konfirmasi kata sandi" 
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Mendaftar...' : 'Daftar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <PenTool className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Auto-save Jawaban</h3>
                <p className="text-slate-600">Jawaban Anda tersimpan otomatis untuk mencegah kehilangan data</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Multi-device Support</h3>
                <p className="text-slate-600">Akses sistem ujian dari perangkat apa saja, kapan saja</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Sistem Ujian Universitas Waskita Dharma</p>
        </div>
      </footer>
    </div>
  )
}