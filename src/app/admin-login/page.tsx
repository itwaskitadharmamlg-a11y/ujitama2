'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, User, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    username: 'Ali',
    password: 'Alibersaudara124*'
  })
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...loginData,
          role: 'ADMIN'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        setMessage('✅ Login berhasil! Mengarahkan ke dashboard...')
        
        // Redirect to admin dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard/lecturer')
        }, 1000)
      } else {
        setMessage(`❌ ${data.error || 'Login gagal'}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage('❌ Terjadi kesalahan saat login. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Login
          </Link>
        </div>

        {/* Login Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Login Administrator</CardTitle>
            <CardDescription className="text-slate-600">
              Masuk ke dashboard sistem ujian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default credentials info */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Login Credentials:</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Username:</span> <code className="bg-white px-2 py-1 rounded">Ali</code></p>
                <p><span className="font-medium">Password:</span> <code className="bg-white px-2 py-1 rounded">Alibersaudara124*</code></p>
              </div>
              <p className="text-xs text-red-600 mt-2">
                Klik tombol "Login dengan Default" untuk menggunakan credentials di atas.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    className="pl-10"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
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
                    type="password"
                    placeholder="Masukkan kata sandi"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
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

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}

            {/* Quick Login Button */}
            <Button 
              onClick={() => {
                setLoginData({
                  username: 'Ali',
                  password: 'Alibersaudara124*'
                })
                setTimeout(() => {
                  const form = document.querySelector('form') as HTMLFormElement
                  if (form) form.requestSubmit()
                }, 100)
              }}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
              disabled={isLoading}
            >
              ⚡ Login dengan Default Credentials
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Lupa password? Hubungi IT Support Universitas Waskita Dharma
          </p>
        </div>
      </div>
    </div>
  )
}