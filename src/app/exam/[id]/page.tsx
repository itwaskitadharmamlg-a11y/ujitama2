'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'ESSAY'
  options?: string[]
  maxScore: number
}

interface Exam {
  id: string
  title: string
  description: string
  duration: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface Answer {
  questionId: string
  answer: string
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [examResultId, setExamResultId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchExamData()
  }, [params.id])

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && examStarted) {
      handleSubmitExam()
    }
  }, [timeLeft, examStarted])

  const fetchExamData = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        router.push('/login')
        return
      }

      // Fetch exam details
      const examResponse = await fetch(`/api/exams/${params.id}`)
      if (!examResponse.ok) {
        alert('Ujian tidak ditemukan')
        router.push('/dashboard/student')
        return
      }
      
      const examData = await examResponse.json()
      setExam(examData)

      // Check if exam is active and within time range
      const now = new Date()
      const startTime = new Date(examData.startTime)
      const endTime = new Date(examData.endTime)

      if (!examData.isActive) {
        alert('Ujian tidak aktif')
        router.push('/dashboard/student')
        return
      }

      if (now < startTime) {
        alert('Ujian belum dimulai')
        router.push('/dashboard/student')
        return
      }

      if (now > endTime) {
        alert('Ujian telah berakhir')
        router.push('/dashboard/student')
        return
      }

      // Fetch questions
      const questionsResponse = await fetch(`/api/exams/${params.id}/questions`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData)
        
        // Initialize answers array
        const initialAnswers = questionsData.map((q: Question) => ({
          questionId: q.id,
          answer: ''
        }))
        setAnswers(initialAnswers)
      }

      // Check if already started
      const resultResponse = await fetch(`/api/exam-results/check?examId=${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (resultResponse.ok) {
        const resultData = await resultResponse.json()
        if (resultData.status === 'COMPLETED') {
          alert('Anda sudah menyelesaikan ujian ini')
          router.push(`/exam-result/${resultData.id}`)
          return
        } else if (resultData.status === 'IN_PROGRESS') {
          setExamResultId(resultData.id)
          setExamStarted(true)
          
          // Calculate time left
          const startedAt = new Date(resultData.startedAt)
          const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
          const totalTime = examData.duration * 60
          const remaining = Math.max(0, totalTime - elapsed)
          setTimeLeft(remaining)
          
          // Load existing answers
          if (resultData.answers) {
            setAnswers(resultData.answers)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching exam data:', error)
      alert('Terjadi kesalahan saat memuat data ujian')
      router.push('/dashboard/student')
    } finally {
      setIsLoading(false)
    }
  }

  const startExam = async () => {
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')

      const response = await fetch('/api/exam-results/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examId: params.id,
          studentId: user.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        setExamResultId(result.id)
        setExamStarted(true)
        setTimeLeft(exam!.duration * 60)
      } else {
        alert('Gagal memulai ujian')
      }
    } catch (error) {
      console.error('Error starting exam:', error)
      alert('Terjadi kesalahan saat memulai ujian')
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => 
      prev.map(a => a.questionId === questionId ? { ...a, answer } : a)
    )
    
    // Auto-save
    saveAnswers()
  }

  const saveAnswers = useCallback(async () => {
    if (!examResultId) return

    try {
      await fetch('/api/exam-results/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resultId: examResultId,
          answers
        })
      })
    } catch (error) {
      console.error('Error saving answers:', error)
    }
  }, [examResultId, answers])

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleSubmitExam = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/exam-results/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resultId: examResultId,
          answers
        })
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/exam-result/${result.id}`)
      } else {
        alert('Gagal mengumpulkan ujian')
      }
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert('Terjadi kesalahan saat mengumpulkan ujian')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data ujian...</p>
        </div>
      </div>
    )
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Ujian Tidak Tersedia</h2>
          <p className="text-slate-600 mb-4">Halaman akan kosong pada saat pertama login karena dosen belum membuat soal ujian</p>
          <Button onClick={() => router.push('/dashboard/student')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 text-center">{exam.description}</p>
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600">Durasi: {exam.duration} menit</p>
              <p className="text-sm text-slate-600">Jumlah soal: {questions.length}</p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Pastikan Anda siap sebelum memulai ujian. Waktu akan berjalan secara otomatis.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={startExam} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Mulai Ujian
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/dashboard/student')}
            >
              Batal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-slate-900">{exam.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={saveAnswers}>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              Soal {currentQuestionIndex + 1} dari {questions.length}
            </span>
            <span className="text-sm text-slate-600">
              {Math.round(progress)}% Selesai
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="text-lg">Soal {currentQuestionIndex + 1}</span>
                <span className="text-sm text-slate-600">Poin: {currentQuestion?.maxScore}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-slate-900 leading-relaxed">{currentQuestion?.question}</p>
              </div>

              {currentQuestion?.type === 'MULTIPLE_CHOICE' && (
                <RadioGroup
                  value={currentAnswer?.answer || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion?.type === 'ESSAY' && (
                <Textarea
                  placeholder="Tulis jawaban Anda di sini..."
                  value={currentAnswer?.answer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  rows={6}
                  className="w-full"
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sebelumnya
            </Button>

            <div className="flex items-center space-x-2">
              {currentAnswer?.answer && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Terjawab</span>
                </div>
              )}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Mengumpulkan...' : 'Selesai & Kumpulkan'}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Berikutnya
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Question Navigation */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Navigasi Soal</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((question, index) => {
                const answer = answers.find(a => a.questionId === question.id)
                const isAnswered = answer?.answer
                
                return (
                  <Button
                    key={question.id}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={`h-10 w-10 p-0 ${
                      isAnswered ? 'bg-green-100 border-green-300 text-green-700' : ''
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}