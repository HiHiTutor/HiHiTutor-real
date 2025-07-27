import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email?: string
  phone?: string
  userType: 'student' | 'tutor' | 'organization'
  avatarUrl?: string
  avatar?: string
  profileStatus?: 'pending' | 'approved' | 'rejected'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    // 優先使用全局用戶資料（如果存在）
    if (typeof window !== 'undefined' && (window as any).__USER_DATA__) {
      console.log('🔍 使用全局用戶資料:', (window as any).__USER_DATA__)
      setUser((window as any).__USER_DATA__)
      setIsLoading(false)
      // 清除全局資料，避免重複使用
      delete (window as any).__USER_DATA__
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // 先獲取基本用戶資料
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!meRes.ok) throw new Error('Not authenticated')
      const meData = await meRes.json()
      console.log('🔍 API returned user data:', meData)

      // 嘗試獲取詳細資料（包括頭像）
      let profileData = {}
      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (profileRes.ok) {
          profileData = await profileRes.json()
          console.log('🔍 API returned profile data:', profileData)
        }
      } catch (profileError) {
        console.warn('無法獲取詳細資料，使用基本資料:', profileError)
      }

      // 合併資料
      const userData = {
        ...meData,
        ...profileData,
        userType: meData.userType || meData.role // 以 userType 為主
      }
      
      // 如果係 tutor，額外 fetch tutor profile 來獲取 avatarUrl 和檢查審批狀態
      if (userData.userType === 'tutor') {
        try {
          const tutorRes = await fetch('/api/tutors/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (tutorRes.ok) {
            const tutorData = await tutorRes.json()
            console.log('🔍 Tutor profile data:', tutorData)
            
            // 合併 tutor avatar 到 user data
            userData.avatarUrl = tutorData.avatarUrl || tutorData.avatar
            userData.profileStatus = tutorData.profileStatus
            
            // 檢查審批狀態，優先使用用戶資料中的名稱
            if (tutorData.profileStatus && tutorData.profileStatus !== 'approved') {
              // 如果未通過審批，保持原始名稱不變
              console.log('🔍 導師資料未通過審批，保持原始名稱:', userData.name)
            } else if (tutorData.profileStatus === 'approved') {
              // 如果已通過審批，優先使用用戶資料中的名稱（通常是最新的）
              // 只有在用戶資料中沒有名稱時才使用導師資料中的名稱
              if (!userData.name && tutorData.name) {
                userData.name = tutorData.name
                console.log('🔍 導師資料已通過審批，使用導師資料中的名稱:', userData.name)
              } else {
                console.log('🔍 導師資料已通過審批，保持用戶資料中的名稱:', userData.name)
              }
            }
          }
        } catch (tutorError) {
          console.warn('無法獲取 tutor profile:', tutorError)
        }
      }
      
      console.log('🔍 Final user data:', userData)
      setUser(userData)
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

    // 監聽用戶資料更新事件
    const handleUserUpdate = () => {
      console.log('🔔 收到用戶資料更新事件，重新獲取用戶資料')
      fetchUser()
    }

    window.addEventListener('login', handleLogin)
    window.addEventListener('logout', handleLogout)
    window.addEventListener('userUpdate', handleUserUpdate)

    return () => {
      window.removeEventListener('login', handleLogin)
      window.removeEventListener('logout', handleLogout)
      window.removeEventListener('userUpdate', handleUserUpdate)
    }
  }, [])

  // 對於 tutor 用戶，添加定期檢查審批狀態的機制
  useEffect(() => {
    // 檢查是否有 token
    const token = localStorage.getItem('token')
    if (!token) return

    let intervalId: NodeJS.Timeout

    // 每隔60秒檢查一次審批狀態
    intervalId = setInterval(async () => {
      try {
        const currentToken = localStorage.getItem('token')
        if (!currentToken) {
          clearInterval(intervalId)
          return
        }

        // 先檢查用戶類型
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
          },
        })
        
        if (!meRes.ok) {
          clearInterval(intervalId)
          return
        }

        const meData = await meRes.json()
        if (meData.userType !== 'tutor') {
          return // 不是 tutor，不需要檢查
        }

        // 檢查 tutor profile 狀態
        const tutorRes = await fetch('/api/tutors/profile', {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
          },
        })
        
        if (tutorRes.ok) {
          const tutorData = await tutorRes.json()
          
          // 如果審批狀態發生變化，更新用戶資料
          if (tutorData.profileStatus !== user?.profileStatus) {
            console.log('🔄 審批狀態發生變化:', user?.profileStatus, '→', tutorData.profileStatus)
            
            // 觸發用戶資料更新事件
            window.dispatchEvent(new CustomEvent('userUpdate'))
            
            // 強制更新 localStorage 中的用戶資料
            const currentUserStr = localStorage.getItem('user')
            if (currentUserStr) {
              try {
                const currentUser = JSON.parse(currentUserStr)
                const updatedUser = {
                  ...currentUser,
                  name: tutorData.profileStatus === 'approved' ? tutorData.name : currentUser.name,
                  profileStatus: tutorData.profileStatus
                }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                console.log('💾 已更新 localStorage 中的用戶資料')
              } catch (error) {
                console.error('更新 localStorage 失敗:', error)
              }
            }
            
            // 顯示通知
            if (tutorData.profileStatus === 'approved') {
              // 使用 react-hot-toast
              import('react-hot-toast').then(({ toast }) => {
                toast.success('🎉 恭喜！您的資料已通過審批！')
              })
            } else if (tutorData.profileStatus === 'rejected') {
              import('react-hot-toast').then(({ toast }) => {
                toast.error(`❌ 您的資料未通過審批：${tutorData.remarks || '請檢查並重新提交'}`)
              })
            }
          }
        }
      } catch (error) {
        console.error('檢查審批狀態失敗:', error)
      }
    }, 30000) // 30秒檢查一次

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, []) // 移除依賴項，避免重複設置定時器

  return { user, isLoading }
} 