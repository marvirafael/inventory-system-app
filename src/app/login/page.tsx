'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import PinInput from '@/components/PinInput'
import { auth } from '@/lib/auth'

export default function LoginPage() {
  const [error, setError] = useState('')
  const router = useRouter()

  const handlePinSubmit = (pin: string) => {
    if (auth.login(pin)) {
      router.push('/home')
    } else {
      setError('Invalid PIN. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="large" />
          <h1 className="text-3xl font-bold text-white mb-2">
            SYSTEM INVENTORY APP
          </h1>
          <p className="text-primary-200 mb-6">
            Created by<br />
            <span className="font-semibold text-accent-300">SYNTROPIC ACCELERATION</span>
          </p>
          <p className="text-primary-300 text-lg">
            Enter PIN to continue
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <PinInput onSubmit={handlePinSubmit} error={error} />
        </div>

        <div className="text-center mt-6">
          <p className="text-primary-300 text-sm">
            Default PIN: 2580
          </p>
        </div>
      </div>
    </div>
  )
}
