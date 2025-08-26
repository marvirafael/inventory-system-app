'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'

export default function ProcessingPage() {
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }
  }, [router])

  const processingOptions = [
    {
      title: 'Transfer',
      subtitle: 'Move items between locations',
      description: 'Transfer inventory between Storage ↔ Processing',
      path: '/processing/transfer',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'Produce Batch',
      subtitle: 'Execute production recipes',
      description: 'Convert raw materials into finished goods',
      path: '/processing/produce',
      color: 'bg-accent-600 hover:bg-accent-700'
    }
  ]

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Processing</h1>
              <p className="text-primary-600">Transfer inventory and execute production</p>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="text-primary-600 hover:text-primary-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processingOptions.map((option) => (
            <button
              key={option.path}
              onClick={() => router.push(option.path)}
              className={`${option.color} text-white p-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl text-left`}
            >
              <h2 className="text-2xl font-bold mb-2">{option.title}</h2>
              <p className="text-white/90 mb-3">{option.subtitle}</p>
              <p className="text-white/75 text-sm">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
