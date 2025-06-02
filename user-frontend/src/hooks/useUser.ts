import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  userType: 'student' | 'tutor' | 'organization'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Not authenticated')
        const data = await res.json()
        // 兼容 userType/role
        setUser({
          ...data,
          userType: data.userType || data.role // 以 userType 為主
        })
      } catch (err) {
        console.warn('🔒 無法取得用戶資料：', err instanceof Error ? err.message : '未知錯誤')
        setUser(null)
        // 如果 token 無效，清除它
        if (err instanceof Error && err.message === 'Not authenticated') {
          localStorage.removeItem('token')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, isLoading }
} 