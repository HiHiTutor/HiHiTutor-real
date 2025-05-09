import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  role: 'student' | 'tutor' | 'admin'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    // 從 API 獲取用戶信息
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          // token 無效，清除它
          localStorage.removeItem('token')
        }
      } catch (err) {
        console.error('獲取用戶信息失敗:', err)
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, isLoading }
} 