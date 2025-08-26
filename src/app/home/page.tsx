'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { auth } from '@/lib/auth'
import { offlineQueue } from '@/lib/offline-queue'

export default function HomePage() {
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('online')
  const [queueCount, setQueueCount] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Check offline queue
    const checkQueue = async () => {
      const items = await offlineQueue.getAll()
      setQueueCount(items.length)
    }

    // Check online status
    const updateOnlineStatus = () => {
      setSyncStatus(navigator.onLine ? 'online' : 'offline')
    }

    // Update time remaining
    const updateTimeRemaining = () => {
      setTimeRemaining(auth.getTimeRemaining())
    }

    checkQueue()
    updateOnlineStatus()
    updateTimeRemaining()

    // Set up intervals
    const timeInterval = setInterval(updateTimeRemaining, 60000) // Update every minute

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      clearInterval(timeInterval)
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [router])

  const handleSync = async () => {
    if (syncStatus === 'offline') return
    
    setSyncStatus('syncing')
    try {
      await offlineQueue.sync()
      const items = await offlineQueue.getAll()
      setQueueCount(items.length)
    } catch (error) {
      console.error('Sync failed:', error)
    }
    setSyncStatus('online')
  }

  const handleLogout = () => {
    auth.logout()
    router.push('/login')
  }

  const navigationButtons = [
    { title: 'Storage', subtitle: 'Receive Inventory', path: '/storage', color: 'bg-primary-600 hover:bg-primary-700' },
    { title: 'Processing', subtitle: 'Transfer & Produce', path: '/processing', color: 'bg-primary-600 hover:bg-primary-700' },
    { title: 'Exit', subtitle: 'Dispatch Goods', path: '/exit', color: 'bg-primary-600 hover:bg-primary-700' },
    { title: 'Stock', subtitle: 'View Inventory', path: '/stock', color: 'bg-accent-600 hover:bg-accent-700' },
    { title: 'History', subtitle: 'Transaction Log', path: '/history', color: 'bg-accent-600 hover:bg-accent-700' }
  ]

  // Prevent hydration mismatch by not rendering time-dependent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="small" />
              <div>
                <h1 className="text-xl font-bold text-primary-900">System Inventory</h1>
                <p className="text-sm text-primary-600">Operator Interface</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  syncStatus === 'online' ? 'bg-green-500' :
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-sm text-primary-600">
                  {syncStatus === 'online' ? 'Online' :
                   syncStatus === 'syncing' ? 'Syncing...' :
                   'Offline'}
                </span>
                {queueCount > 0 && (
                  <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                    {queueCount}
                  </span>
                )}
              </div>

              {/* Sync Button */}
              {syncStatus === 'online' && queueCount > 0 && (
                <button
                  onClick={handleSync}
                  className="text-sm bg-accent-600 hover:bg-accent-700 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Sync
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationButtons.map((button) => (
            <button
              key={button.path}
              onClick={() => router.push(button.path)}
              className={`${button.color} text-white p-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl`}
            >
              <h2 className="text-2xl font-bold mb-2">{button.title}</h2>
              <p className="text-white/90">{button.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Session Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-primary-500">
            Session expires in {hours}h {minutes}m
          </p>
        </div>
      </div>
    </div>
  )
}
