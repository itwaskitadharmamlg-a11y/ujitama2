'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Award, 
  Clock, 
  CheckCircle, 
  MessageSquare,
  Download,
  Calendar,
  User
} from 'lucide-react'

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'ESSAY'
  options?: string[]
  maxScore: number
}

interface Answer {
  id: string
  questionId: string
  answer: string
  isCorrect?: boolean
  score?: number
}

interface Feedback {
  id: string
  content: string
  author: {
    name: string
    role: string
  }
  createdAt: string
}

interface ExamResult {
  id: string
  score: number
  maxScore: number
  status: string
  startedAt: string
  finishedAt: string
  exam: {
    id: string
    title: string
    description: string
    duration: number
  }
  answers: Answer[]
  feedbacks: Feedback[]
}

export default function ExamResultPage({ params }: { params: { id: string } }) {
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newFeedback, setNewFeedback] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    fetchExamResult(params.id)
  }, [params.id, router])

  const fetchExamResult = async (resultId: string) => {
    try {
      const response = await fetch(`/api/exam-results/${resultId}`)
      if (response.ok) {
        const data = await response.json()
        setExamResult(data)
      } else {
        alert('Hasil ujian tidak ditemukan')
        router.push('/dashboard/student')
      }
    } catch (error) {
      console.error('Error fetching exam result:', error)
      alert('Terjadi kesalahan saat memuat hasil ujian')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newFeedback.trim()) return

    setIsSubmittingFeedback(true)
    try {
      const response = await fetch(`/api/exam-results/${params.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newFeedback
        })
      })

      if (response.ok) {
        setNewFeedback('')
        fetchExamResult(params.id)
      } else {
        alert('Gagal mengirim feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Terjadi kesalahan saat mengirim feedback')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B+'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C+'
    if (percentage >= 50) return 'C'
    if (percentage >= 40) return 'D'
    return 'E'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat hasil ujian...</p>
        </div>
      </div>
    )
  }

  if (!examResult) {
    return null
  }

  const percentage = examResult.maxScore ? (examResult.score / examResult.maxScore) * 100 : 0
  const grade = getGrade(percentage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Hasil Ujian</h1>
                <p className="text-sm text-slate-600">{examResult.exam.title}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Score Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Selamat! Ujian Selesai</CardTitle>
              <CardDescription>
                Berikut adalah hasil ujian Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                        {examResult.score}/{examResult.maxScore}
                      </p>
                      <p className="text-sm text-slate-600">{Math.round(percentage)}%</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="text-lg px-4 py-1 bg-blue-600">
                      Grade {grade}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-600">
                    Durasi: {examResult.exam.duration} menit
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-600">
                    Selesai: {new Date(examResult.finishedAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600">
                    Status: Selesai
                  </span>
                </div>
              </div>

              <Progress value={percentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Answer Review */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Review Jawaban</CardTitle>
              <CardDescription>
                Lihat kembali jawaban Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {examResult.answers.map((answer, index) => (
                <div key={answer.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">
                      Soal {index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {answer.score || 0} poin
                      </span>
                      {answer.isCorrect !== undefined && (
                        answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-red-500" />
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-sm text-slate-900">
                        Jawaban Anda: {answer.answer || 'Tidak dijawab'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Feedback & Komentar
              </CardTitle>
              <CardDescription>
                Feedback dari dosen dan balasan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Feedbacks */}
              {examResult.feedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Belum ada feedback</p>
                </div>
              ) : (
                examResult.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="font-semibold text-slate-900">
                          {feedback.author.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {feedback.author.role === 'LECTURER' ? 'Dosen' : 'Mahasiswa'}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(feedback.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{feedback.content}</p>
                  </div>
                ))
              )}

              {/* Add Feedback Form */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-semibold text-slate-900 mb-4">Tambah Balasan</h4>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <Textarea
                    placeholder="Tulis feedback atau balasan Anda..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmittingFeedback || !newFeedback.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmittingFeedback ? 'Mengirim...' : 'Kirim Feedback'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}