import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  userType: 'student' | 'tutor' | 'organization'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

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

  useEffect(() => {
    // 初始獲取用戶資料
    fetchUser()

    // 監聽登入事件
    const handleLogin = () => {
      console.log('🔔 收到登入事件，重新獲取用戶資料')
      fetchUser()
    }

    // 監聽登出事件
    const handleLogout = () => {
      console.log('🔔 收到登出事件，清除用戶資料')
      setUser(null)
    }

    window.addEventListener('login', handleLogin)
    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('login', handleLogin)
      window.removeEventListener('logout', handleLogout)
    }
  }, [])

  return { user, isLoading }
} 