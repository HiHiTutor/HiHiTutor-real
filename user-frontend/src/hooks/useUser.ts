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
  pendingProfile?: {
    name?: string
    phone?: string
    email?: string
    tutorProfile?: any
    documents?: any
    status: 'pending' | 'approved' | 'rejected'
    submittedAt: string
    adminRemarks?: string
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // 從 /api/me 獲取最新用戶資料
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!meRes.ok) {
        if (meRes.status === 401) {
          console.warn('🔒 Token 無效，清除並重新導向登入')
          localStorage.removeItem('token')
          setUser(null)
          setError('登入已過期，請重新登入')
          return
        } else if (meRes.status === 500) {
          console.error('🔒 伺服器錯誤')
          setError('伺服器暫時無法回應，請稍後再試')
          return
        } else {
          throw new Error(`HTTP ${meRes.status}: ${meRes.statusText}`)
        }
      }

      const meData = await meRes.json()
      console.log('🔍 API returned user data:', meData)
      console.log('🔍 meData.pendingProfile:', meData.pendingProfile)

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
      
      console.log('🔍 合併後的 userData:', userData)
      console.log('🔍 userData.pendingProfile:', userData.pendingProfile)
      
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
            
            // 檢查 pendingProfile 狀態（導師更新申請）- 優先檢查
            if (userData.pendingProfile) {
              console.log('🔍 發現 pendingProfile:', userData.pendingProfile);
              
              if (userData.pendingProfile.status === 'pending') {
                if (userData.pendingProfile.name) {
                  console.log('🔍 有待審批的名稱變更:', userData.pendingProfile.name);
                  // 不立即更新顯示名稱，保持當前名稱直到審批通過
                }
              } else if (userData.pendingProfile.status === 'approved') {
                // 如果待審批已通過，使用待審批中的新名稱
                if (userData.pendingProfile.name) {
                  userData.name = userData.pendingProfile.name;
                  console.log('🔍 待審批已通過，使用新名稱:', userData.name);
                }
              } else if (userData.pendingProfile.status === 'rejected') {
                console.log('🔍 待審批申請被拒絕');
              }
            } else {
              console.log('🔍 沒有 pendingProfile 資料');
            }

            // 檢查導師個人資料審批狀態
            if (tutorData.profileStatus === 'pending') {
              // 如果未通過審批，使用 tutor profile 中的名稱（舊名稱）
              // 如果用戶基本資料中的名稱與 tutor profile 中的名稱不同，說明有改名申請
              if (userData.name !== tutorData.name) {
                userData.name = tutorData.name
                console.log('🔍 導師資料未通過審批，有改名申請，使用舊名稱:', userData.name)
              } else {
                console.log('🔍 導師資料未通過審批，無改名申請，使用當前名稱:', userData.name)
              }
            } else if (tutorData.profileStatus === 'approved') {
              // 審批通過時，使用用戶基本資料中的新名稱
              console.log('🔍 導師資料已通過審批，使用用戶基本資料中的新名稱:', userData.name)
            } else {
              // 沒有審批狀態或狀態為 rejected 時，使用 tutor profile 中的名稱
              userData.name = tutorData.name || userData.name
              console.log('🔍 導師資料狀態為:', tutorData.profileStatus, '使用 tutor profile 名稱:', userData.name)
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
      
      // 檢查是否為網路錯誤
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('網路連線失敗，請檢查網路設定')
        } else if (err.message.includes('Not authenticated')) {
          localStorage.removeItem('token')
          setError('登入已過期，請重新登入')
        } else {
          setError('無法獲取用戶資料，請稍後再試')
        }
      } else {
        setError('發生未知錯誤，請稍後再試')
      }
      
      setUser(null)
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
      setError(null)
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

  return { user, isLoading, error }
} 