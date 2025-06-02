import { useState } from 'react'

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    userType: 'student' | 'tutor' | 'organization'
  }
}

export function useLogin() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (emailOrPhone: string, password: string): Promise<LoginResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      })
      if (!res.ok) throw new Error('登入失敗')
      const data = await res.json()
      localStorage.setItem('token', data.token) // 儲存 token
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { login, error, loading }
} 