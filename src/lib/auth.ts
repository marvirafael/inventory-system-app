const DEFAULT_PIN = process.env.NEXT_PUBLIC_DEFAULT_PIN || '2580'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

export interface AuthSession {
  isAuthenticated: boolean
  expiresAt: number
}

export const auth = {
  login: (pin: string): boolean => {
    if (pin === DEFAULT_PIN) {
      const session: AuthSession = {
        isAuthenticated: true,
        expiresAt: Date.now() + SESSION_DURATION
      }
      localStorage.setItem('auth_session', JSON.stringify(session))
      return true
    }
    return false
  },

  logout: (): void => {
    localStorage.removeItem('auth_session')
  },

  isAuthenticated: (): boolean => {
    try {
      const sessionData = localStorage.getItem('auth_session')
      if (!sessionData) return false

      const session: AuthSession = JSON.parse(sessionData)
      
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('auth_session')
        return false
      }

      return session.isAuthenticated
    } catch {
      return false
    }
  },

  getTimeRemaining: (): number => {
    try {
      const sessionData = localStorage.getItem('auth_session')
      if (!sessionData) return 0

      const session: AuthSession = JSON.parse(sessionData)
      const remaining = session.expiresAt - Date.now()
      return Math.max(0, remaining)
    } catch {
      return 0
    }
  }
}
