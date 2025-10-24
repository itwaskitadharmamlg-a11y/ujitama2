'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Calendar, 
  BookOpen, 
  Users, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Download,
  Upload,
  Settings
} from 'lucide-react'

interface User {
  id: string
  name: string
  username?: string
  nim?: string
  programStudi?: string
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
  _count: {
    questions: number
  }
}

interface Class {
  id: string
  name: string
  programStudi: string
  description?: string
  _count: {
    students: number
    exams: number
  }
}

export default function LecturerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false)
  const [isEditExamOpen, setIsEditExamOpen] = useState(false)
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false)
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)
  const router = useRouter()

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    endTime: '',
    classId: ''
  })

  const [newClass, setNewClass] = useState({
    name: '',
    programStudi: '',
    description: ''
  })

  const [newStudent, setNewStudent] = useState({
    name: '',
    nim: '',
    password: '',
    programStudi: '',
    classIds: [] as string[]
  })

  const [isCreateLecturerOpen, setIsCreateLecturerOpen] = useState(false)
  const [newLecturer, setNewLecturer] = useState({
    name: '',
    username: '',
    password: '',
    programStudi: ''
  })

  const [lecturers, setLecturers] = useState<User[]>([])

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
    if (parsedUser.role !== 'LECTURER' && parsedUser.role !== 'ADMIN') {
      router.push('/dashboard/student')
      return
    }

    setUser(parsedUser)
  }, [router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch exams
      const examsResponse = await fetch('/api/exams')
      if (examsResponse.ok) {
        const examsData = await examsResponse.json()
        setExams(examsData)
      }

      // Fetch students
      const studentsResponse = await fetch('/api/users?role=STUDENT')
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData)
      }

      // Fetch classes
      const classesResponse = await fetch('/api/classes')
      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        setClasses(classesData)
      }

      // Fetch lecturers (only for admin)
      if (user?.role === 'ADMIN') {
        const lecturersResponse = await fetch('/api/users?role=LECTURER')
        if (lecturersResponse.ok) {
          const lecturersData = await lecturersResponse.json()
          setLecturers(lecturersData)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const toggleExamStatus = async (examId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchDashboardData()
      } else {
        alert('Gagal mengubah status ujian')
      }
    } catch (error) {
      console.error('Error toggling exam status:', error)
      alert('Terjadi kesalahan saat mengubah status ujian')
    }
  }

  const deleteExam = async (examId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ujian ini?')) return

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchDashboardData()
      } else {
        alert('Gagal menghapus ujian')
      }
    } catch (error) {
      console.error('Error deleting exam:', error)
      alert('Terjadi kesalahan saat menghapus ujian')
    }
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newExam,
          createdBy: user?.id
        })
      })

      if (response.ok) {
        setIsCreateExamOpen(false)
        setNewExam({
          title: '',
          description: '',
          duration: 60,
          startTime: '',
          endTime: '',
          classId: ''
        })
        fetchDashboardData()
        alert('Ujian berhasil dibuat')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal membuat ujian')
      }
    } catch (error) {
      console.error('Error creating exam:', error)
      alert('Terjadi kesalahan saat membuat ujian')
    }
  }

  const handleEditExam = (exam: any) => {
    setEditingExam(exam)
    setIsEditExamOpen(true)
  }

  const handleUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingExam) return
    
    try {
      const response = await fetch(`/api/exams/${editingExam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingExam)
      })

      if (response.ok) {
        setIsEditExamOpen(false)
        setEditingExam(null)
        fetchDashboardData()
        alert('Ujian berhasil diperbarui')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal memperbarui ujian')
      }
    } catch (error) {
      console.error('Error updating exam:', error)
      alert('Terjadi kesalahan saat memperbarui ujian')
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newClass,
          createdBy: user?.id
        })
      })

      if (response.ok) {
        setIsCreateClassOpen(false)
        setNewClass({
          name: '',
          programStudi: '',
          description: ''
        })
        fetchDashboardData()
        alert('Kelas berhasil dibuat')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal membuat kelas')
      }
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Terjadi kesalahan saat membuat kelas')
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newStudent,
          role: 'STUDENT'
        })
      })

      if (response.ok) {
        setIsCreateStudentOpen(false)
        setNewStudent({
          name: '',
          nim: '',
          password: '',
          programStudi: '',
          classIds: []
        })
        fetchDashboardData()
        alert('Mahasiswa berhasil dibuat')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal membuat mahasiswa')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Terjadi kesalahan saat membuat mahasiswa')
    }
  }

  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newLecturer,
          role: 'LECTURER'
        })
      })

      if (response.ok) {
        setIsCreateLecturerOpen(false)
        setNewLecturer({
          name: '',
          username: '',
          password: '',
          programStudi: ''
        })
        fetchDashboardData()
        alert('Dosen berhasil dibuat')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal membuat dosen')
      }
    } catch (error) {
      console.error('Error creating lecturer:', error)
      alert('Terjadi kesalahan saat membuat dosen')
    }
  }

  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      ['Pertanyaan', 'Jenis Soal (MULTIPLE_CHOICE/ESSAY)', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Pilihan E', 'Jawaban Benar', 'Skor Maksimal'],
      ['Siapa presiden pertama Indonesia?', 'MULTIPLE_CHOICE', 'Soekarno', 'Soeharto', 'Habibie', 'Megawati', 'Jokowi', 'A', '1'],
      ['Jelaskan pengertian demokrasi!', 'ESSAY', '', '', '', '', '', '', '5']
    ]

    // Create CSV content
    const csvContent = templateData.map(row => row.join(',')).join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_soal.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUploadQuestions = (examId: string) => {
    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xls'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/exams/${examId}/questions/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          alert('Soal berhasil diunggah!')
          fetchDashboardData()
        } else {
          const error = await response.json()
          alert(error.error || 'Gagal mengunggah soal')
        }
      } catch (error) {
        console.error('Error uploading questions:', error)
        alert('Terjadi kesalahan saat mengunggah soal')
      }
    }
    
    input.click()
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
                <h1 className="text-lg font-bold text-slate-900">
                  Dashboard {user.role === 'ADMIN' ? 'Administrator' : 'Dosen'}
                </h1>
                <p className="text-sm text-slate-600">Universitas Waskita Dharma</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-600">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Dosen'}
                </p>
              </div>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Ujian</p>
                    <p className="text-2xl font-bold text-slate-900">{exams.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Ujian Aktif</p>
                    <p className="text-2xl font-bold text-green-600">
                      {exams.filter(e => e.isActive).length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Mahasiswa</p>
                    <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Program Studi</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {new Set(students.map(s => s.programStudi)).size}
                    </p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="exams" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="exams">Ujian</TabsTrigger>
              <TabsTrigger value="classes">Kelas</TabsTrigger>
              <TabsTrigger value="students">Mahasiswa</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>

            <TabsContent value="exams" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Daftar Ujian</h2>
                <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Ujian Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Buat Ujian Baru</DialogTitle>
                      <DialogDescription>
                        Isi detail ujian yang akan dibuat
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="examTitle">Judul Ujian</Label>
                        <Input
                          id="examTitle"
                          value={newExam.title}
                          onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="examDescription">Deskripsi</Label>
                        <Textarea
                          id="examDescription"
                          value={newExam.description}
                          onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="examDuration">Durasi (menit)</Label>
                        <Input
                          id="examDuration"
                          type="number"
                          value={newExam.duration}
                          onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="examClass">Kelas</Label>
                        <Select value={newExam.classId} onValueChange={(value) => setNewExam({ ...newExam, classId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} - {cls.programStudi}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="examStart">Waktu Mulai</Label>
                          <Input
                            id="examStart"
                            type="datetime-local"
                            value={newExam.startTime}
                            onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="examEnd">Waktu Selesai</Label>
                          <Input
                            id="examEnd"
                            type="datetime-local"
                            value={newExam.endTime}
                            onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Buat Ujian
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Edit Exam Dialog */}
              <Dialog open={isEditExamOpen} onOpenChange={setIsEditExamOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Ujian</DialogTitle>
                    <DialogDescription>
                      Perbarui detail ujian yang ada
                    </DialogDescription>
                  </DialogHeader>
                  {editingExam && (
                    <form onSubmit={handleUpdateExam} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editExamTitle">Judul Ujian</Label>
                        <Input
                          id="editExamTitle"
                          value={editingExam.title}
                          onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editExamDescription">Deskripsi</Label>
                        <Textarea
                          id="editExamDescription"
                          value={editingExam.description}
                          onChange={(e) => setEditingExam({ ...editingExam, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editExamDuration">Durasi (menit)</Label>
                          <Input
                            id="editExamDuration"
                            type="number"
                            value={editingExam.duration}
                            onChange={(e) => setEditingExam({ ...editingExam, duration: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editExamClass">Kelas</Label>
                          <Select value={editingExam.classId} onValueChange={(value) => setEditingExam({ ...editingExam, classId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editExamStart">Waktu Mulai</Label>
                          <Input
                            id="editExamStart"
                            type="datetime-local"
                            value={editingExam.startTime ? new Date(editingExam.startTime).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditingExam({ ...editingExam, startTime: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editExamEnd">Waktu Selesai</Label>
                          <Input
                            id="editExamEnd"
                            type="datetime-local"
                            value={editingExam.endTime ? new Date(editingExam.endTime).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditingExam({ ...editingExam, endTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Perbarui Ujian
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <div className="grid gap-4">
                {exams.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Belum ada ujian</p>
                    </CardContent>
                  </Card>
                ) : (
                  exams.map((exam) => (
                    <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{exam.title}</h3>
                              <Badge className={exam.isActive ? 'bg-green-500' : 'bg-slate-500'}>
                                {exam.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{exam.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>Kelas: {exam.class.name}</span>
                              <span>Durasi: {exam.duration} menit</span>
                              <span>Soal: {exam._count.questions}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(exam.startTime).toLocaleDateString('id-ID')} - {new Date(exam.endTime).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant={exam.isActive ? "destructive" : "default"}
                              onClick={() => toggleExamStatus(exam.id, exam.isActive)}
                            >
                              {exam.isActive ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditExam(exam)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate()}>
                              <Download className="w-4 h-4 mr-2" />
                              Template
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleUploadQuestions(exam.id)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Soal
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteExam(exam.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Daftar Kelas</h2>
                <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Kelas Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Buat Kelas Baru</DialogTitle>
                      <DialogDescription>
                        Isi detail kelas yang akan dibuat
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClass} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="className">Nama Kelas</Label>
                        <Input
                          id="className"
                          value={newClass.name}
                          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="classProgramStudi">Program Studi</Label>
                        <Select value={newClass.programStudi} onValueChange={(value) => setNewClass({ ...newClass, programStudi: value })}>
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
                        <Label htmlFor="classDescription">Deskripsi</Label>
                        <Textarea
                          id="classDescription"
                          value={newClass.description}
                          onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Buat Kelas
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {classes.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Belum ada kelas</p>
                    </CardContent>
                  </Card>
                ) : (
                  classes.map((classItem) => (
                    <Card key={classItem.id} className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{classItem.name}</h3>
                              <Badge className="bg-blue-500">
                                {classItem.programStudi}
                              </Badge>
                            </div>
                            {classItem.description && (
                              <p className="text-sm text-slate-600 mb-2">{classItem.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>{classItem._count.students} Mahasiswa</span>
                              <span>{classItem._count.exams} Ujian</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Daftar Mahasiswa</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Excel
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Mahasiswa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Tambah Mahasiswa Baru</DialogTitle>
                        <DialogDescription>
                          Isi data mahasiswa yang akan ditambahkan
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateStudent} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="studentName">Nama Lengkap</Label>
                          <Input
                            id="studentName"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentNim">NIM</Label>
                          <Input
                            id="studentNim"
                            value={newStudent.nim}
                            onChange={(e) => setNewStudent({ ...newStudent, nim: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentPassword">Password</Label>
                          <Input
                            id="studentPassword"
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentProgramStudi">Program Studi</Label>
                          <Select value={newStudent.programStudi} onValueChange={(value) => setNewStudent({ ...newStudent, programStudi: value })}>
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
                          Tambah Mahasiswa
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Nama</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">NIM</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Program Studi</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-slate-600">
                              Belum ada mahasiswa terdaftar
                            </td>
                          </tr>
                        ) : (
                          students.map((student) => (
                            <tr key={student.id} className="border-b border-slate-100">
                              <td className="py-3 px-4 text-sm text-slate-900">{student.name}</td>
                              <td className="py-3 px-4 text-sm text-slate-900">{student.nim}</td>
                              <td className="py-3 px-4 text-sm text-slate-900">{student.programStudi}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Pengaturan</h2>
              
              <div className="grid gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle>Manajemen Soal</CardTitle>
                    <CardDescription>
                      Upload soal ujian dalam format Excel atau download template
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleDownloadTemplate}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Template Soal
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUploadQuestions}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Soal
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">
                      Template berisi format soal pilihan ganda dan essay. Upload akan segera tersedia.
                    </p>
                  </CardContent>
                </Card>

                {user.role === 'ADMIN' && (
                  <>
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardHeader>
                        <CardTitle>Manajemen Dosen</CardTitle>
                        <CardDescription>
                          Kelola akun dosen
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Dialog open={isCreateLecturerOpen} onOpenChange={setIsCreateLecturerOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Tambah Dosen Baru
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Tambah Dosen Baru</DialogTitle>
                              <DialogDescription>
                                Buat akun dosen baru
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateLecturer} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="lecturerName">Nama Lengkap</Label>
                                <Input
                                  id="lecturerName"
                                  value={newLecturer.name}
                                  onChange={(e) => setNewLecturer({ ...newLecturer, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lecturerUsername">Username</Label>
                                <Input
                                  id="lecturerUsername"
                                  value={newLecturer.username}
                                  onChange={(e) => setNewLecturer({ ...newLecturer, username: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lecturerPassword">Password</Label>
                                <Input
                                  id="lecturerPassword"
                                  type="password"
                                  value={newLecturer.password}
                                  onChange={(e) => setNewLecturer({ ...newLecturer, password: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lecturerProgramStudi">Program Studi</Label>
                                <Select value={newLecturer.programStudi} onValueChange={(value) => setNewLecturer({ ...newLecturer, programStudi: value })}>
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
                                Tambah Dosen
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardHeader>
                        <CardTitle>Daftar Dosen</CardTitle>
                        <CardDescription>
                          Daftar dosen yang terdaftar dalam sistem
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Nama</th>
                                <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Username</th>
                                <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Program Studi</th>
                                <th className="text-left py-2 px-4 text-sm font-semibold text-slate-900">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lecturers.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="text-center py-8 text-slate-600">
                                    Belum ada dosen terdaftar
                                  </td>
                                </tr>
                              ) : (
                                lecturers.map((lecturer) => (
                                  <tr key={lecturer.id} className="border-b border-slate-100">
                                    <td className="py-3 px-4 text-sm text-slate-900">{lecturer.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-900">{lecturer.username}</td>
                                    <td className="py-3 px-4 text-sm text-slate-900">{lecturer.programStudi || '-'}</td>
                                    <td className="py-3 px-4">
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive">
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}