'use client'

import { useState, useEffect } from 'react'

interface PinInputProps {
  onSubmit: (pin: string) => void
  error?: string
}

export default function PinInput({ onSubmit, error }: PinInputProps) {
  const [pin, setPin] = useState('')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      
      if (newPin.length === 4) {
        setTimeout(() => {
          onSubmit(newPin)
          setPin('')
        }, 100)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* PIN Display */}
      <div className="flex justify-center mb-8">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`pin-dot ${index < pin.length ? 'filled' : ''}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {showError && (
        <div className="text-red-600 text-center mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit.toString())}
            className="aspect-square bg-white border-2 border-primary-300 rounded-lg text-xl font-semibold text-primary-800 hover:bg-primary-50 hover:border-primary-400 transition-colors duration-200"
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleClear}
          className="aspect-square bg-white border-2 border-primary-300 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-400 transition-colors duration-200"
        >
          Clear
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="aspect-square bg-white border-2 border-primary-300 rounded-lg text-xl font-semibold text-primary-800 hover:bg-primary-50 hover:border-primary-400 transition-colors duration-200"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="aspect-square bg-white border-2 border-primary-300 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-400 transition-colors duration-200"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
