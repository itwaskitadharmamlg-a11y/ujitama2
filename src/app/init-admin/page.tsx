'use client'

import { useState, useEffect } from 'react'

export default function InitAdminPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const initializeAdmin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Inisialisasi Administrator
          </h1>
          <p className="text-slate-600 mb-6">
            Klik tombol di bawah untuk membuat user administrator dengan:
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-slate-700">
              Username: Ali<br />
              Password: Alibersaudara124*
            </p>
          </div>
          <button
            onClick={initializeAdmin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Buat Administrator'}
          </button>
          {message && (
            <div className="mt-4 p-3 rounded-lg bg-slate-100 text-sm text-slate-700">
              {message}
            </div>
          )}
          <div className="mt-6 text-xs text-slate-500">
            Setelah administrator dibuat, Anda bisa login ke dashboard administrator.
          </div>
        </div>
      </div>
    </div>
  )
}