'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  Award, 
  Edit, 
  LogOut,
  Play,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface User {
  id: string
  name: string
  nim: string
  programStudi: string
  role: string
}

interface Exam {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number
  isActive: boolean
  class: {
    name: string
  }
}

interface ExamResult {
  id: string
  score: number | null
  maxScore: number | null
  status: string
  startedAt: string | null
  finishedAt: string | null
  exam: Exam
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    nim: '',
    programStudi: ''
  })
  const router = useRouter()

  const programStudiOptions = [
    'S1 Ilmu Administrasi Negara',
    'S1 Bisnis Digital',
    'S1 Ilmu Pertanian',
    'S1 Peternakan',
    'S1 Kimia',
    'S1 Teknologi Informasi',
    'S2 Magister Administrasi Publik'
  ]

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setEditData({
      name: parsedUser.name,
      nim: parsedUser.nim,
      programStudi: parsedUser.programStudi
    })

    // Fetch exams and results
    fetchStudentData(parsedUser.id)
  }, [router])

  const fetchStudentData = async (userId: string) => {
    try {
      // Fetch exams
      const examsResponse = await fetch('/api/exams')
      if (examsResponse.ok) {
        const examsData = await examsResponse.json()
        setExams(examsData)
      }

      // Fetch exam results
      const resultsResponse = await fetch(`/api/exam-results?studentId=${userId}`)
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json()
        setExamResults(resultsData)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setIsEditProfileOpen(false)
        alert('Profil berhasil diperbarui')
      } else {
        alert('Gagal memperbarui profil')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Terjadi kesalahan saat memperbarui profil')
    }
  }

  const handleStartExam = (examId: string) => {
    router.push(`/exam/${examId}`)
  }

  const getExamStatus = (exam: Exam, result?: ExamResult) => {
    const now = new Date()
    const startTime = new Date(exam.startTime)
    const endTime = new Date(exam.endTime)

    if (!exam.isActive) {
      return { status: 'inactive', text: 'Ujian tidak aktif', color: 'bg-slate-500' }
    }

    if (now < startTime) {
      return { status: 'upcoming', text: 'Belum dimulai', color: 'bg-yellow-500' }
    }

    if (now > endTime) {
      return { status: 'expired', text: 'Ujian berakhir', color: 'bg-red-500' }
    }

    if (result?.status === 'COMPLETED') {
      return { status: 'completed', text: 'Selesai', color: 'bg-green-500' }
    }

    if (result?.status === 'IN_PROGRESS') {
      return { status: 'in_progress', text: 'Sedang berlangsung', color: 'bg-blue-500' }
    }

    return { status: 'available', text: 'Mulai ujian', color: 'bg-green-500' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10">
                <img
                  src="https://iili.io/KgEBP7s.png"
                  alt="Universitas Waskita Dharma"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Dashboard Mahasiswa</h1>
                <p className="text-sm text-slate-600">Universitas Waskita Dharma</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profil
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profil</DialogTitle>
                    <DialogDescription>
                      Perbarui informasi profil Anda
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editName">Nama Lengkap</Label>
                      <Input
                        id="editName"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editNim">NIM</Label>
                      <Input
                        id="editNim"
                        value={editData.nim}
                        onChange={(e) => setEditData({ ...editData, nim: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editProgramStudi">Program Studi</Label>
                      <Select value={editData.programStudi} onValueChange={(value) => setEditData({ ...editData, programStudi: value })}>
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
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Simpan Perubahan
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profil Mahasiswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Nama Lengkap</p>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">NIM</p>
                  <p className="font-semibold text-slate-900">{user.nim}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Program Studi</p>
                  <p className="font-semibold text-slate-900">{user.programStudi}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exams Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Exams */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Jadwal Ujian
                </CardTitle>
                <CardDescription>
                  Ujian yang tersedia untuk Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Belum ada ujian yang tersedia</p>
                      <p className="text-sm text-slate-500 mt-2">Halaman akan kosong pada saat pertama login karena dosen belum membuat soal ujian</p>
                    </div>
                  ) : (
                    exams.map((exam) => {
                      const result = examResults.find(r => r.exam.id === exam.id)
                      const status = getExamStatus(exam, result)
                      
                      return (
                        <div key={exam.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-900">{exam.title}</h3>
                              <p className="text-sm text-slate-600">{exam.description}</p>
                              <p className="text-xs text-slate-500 mt-1">Kelas: {exam.class.name}</p>
                            </div>
                            <Badge className={`${status.color} text-white`}>
                              {status.text}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exam.duration} menit
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(exam.startTime).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          {status.status === 'available' && (
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleStartExam(exam.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Mulai Ujian
                            </Button>
                          )}
                          {status.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleStartExam(exam.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Lanjutkan Ujian
                            </Button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exam Results */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Hasil Ujian
                </CardTitle>
                <CardDescription>
                  Riwayat hasil ujian Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examResults.filter(r => r.status === 'COMPLETED').length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Belum ada hasil ujian</p>
                    </div>
                  ) : (
                    examResults.filter(r => r.status === 'COMPLETED').map((result) => (
                      <div key={result.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{result.exam.title}</h3>
                            <p className="text-sm text-slate-600">{result.exam.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {result.score}/{result.maxScore}
                            </p>
                            <p className="text-sm text-slate-600">
                              {result.maxScore ? Math.round((result.score! / result.maxScore) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={result.maxScore ? (result.score! / result.maxScore) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Selesai: {result.finishedAt ? new Date(result.finishedAt).toLocaleString('id-ID') : '-'}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => router.push(`/exam-result/${result.id}`)}
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}