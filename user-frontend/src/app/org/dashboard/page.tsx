'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrganizationTutor {
  _id: string
  tutorName: string
  tutorEmail: string
  tutorPhone: string
  cv: {
    subjects: string[]
    sessionRate: number
    introduction: string
    educationLevel: string
    teachingExperienceYears: number
  }
  status: 'active' | 'inactive' | 'pending'
  isPublic: boolean
  createdAt: string
}

interface Subscription {
  currentTutors: number
  maxIncludedTutors: number
  additionalTutorFee: number
  monthlyFee: number
  canAddMore: boolean
}

export default function OrganizationDashboard() {
  const router = useRouter()
  const [tutors, setTutors] = useState<OrganizationTutor[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 檢查用戶登入狀態和類型
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.replace('/login?redirect=/org/dashboard')
        return
      }

      try {
        // 從 API 獲取最新用戶資料
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          router.replace('/login?redirect=/org/dashboard')
          return
        }

        const user = await response.json()
        console.log('用戶資料:', user) // 調試用
        
        // 檢查用戶類型
        if (user.userType !== 'organization') {
          console.log('用戶類型不匹配:', user.userType) // 調試用
          alert('只有機構用戶可以訪問此頁面')
          router.replace('/')
          return
        }
        
        setUser(user)
        fetchOrganizationData()
      } catch (error) {
        console.error('獲取用戶資料失敗:', error)
        router.replace('/login?redirect=/org/dashboard')
      }
    }

    checkAuth()
  }, [router])

  const fetchOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 獲取導師列表
      const tutorsResponse = await fetch('/api/organization-tutors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (tutorsResponse.ok) {
        const tutorsData = await tutorsResponse.json()
        setTutors(tutorsData.data.tutors || [])
        setSubscription(tutorsData.data.subscription)
      }

      setLoading(false)
    } catch (error) {
      console.error('獲取機構資料失敗:', error)
      setLoading(false)
    }
  }

  const handleTogglePublic = async (tutorId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/organization-tutors/${tutorId}/toggle-public`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // 重新獲取資料
        fetchOrganizationData()
      }
    } catch (error) {
      console.error('切換公開狀態失敗:', error)
    }
  }

  const handleDeleteTutor = async (tutorId: string) => {
    if (!confirm('確定要刪除此導師嗎？')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/organization-tutors/${tutorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        fetchOrganizationData()
      }
    } catch (error) {
      console.error('刪除導師失敗:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">機構儀表板</h1>
          <p className="mt-2 text-gray-600">管理您的導師團隊和訂閱狀態</p>
        </div>

        {/* 訂閱信息卡片 */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">訂閱狀態</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">當前導師</p>
                <p className="text-2xl font-bold text-blue-900">{subscription.currentTutors}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">包含導師</p>
                <p className="text-2xl font-bold text-green-900">{subscription.maxIncludedTutors}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">月費</p>
                <p className="text-2xl font-bold text-yellow-900">HKD {subscription.monthlyFee}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">額外導師費用</p>
                <p className="text-2xl font-bold text-purple-900">HKD {subscription.additionalTutorFee}/個</p>
              </div>
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/org/tutors/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + 添加新導師
          </Link>
          <Link
            href="/org/subscription"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            訂閱管理
          </Link>
        </div>

        {/* 導師列表 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">導師列表</h2>
          </div>
          
          {tutors.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">還沒有添加任何導師</p>
              <Link
                href="/org/tutors/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                添加第一個導師
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tutors.map((tutor) => (
                <div key={tutor._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{tutor.tutorName}</h3>
                          <p className="text-sm text-gray-500">{tutor.tutorEmail}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tutor.status === 'active' ? 'bg-green-100 text-green-800' :
                            tutor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tutor.status === 'active' ? '活躍' :
                             tutor.status === 'pending' ? '待審核' : '非活躍'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tutor.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tutor.isPublic ? '公開' : '隱藏'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <p>科目: {tutor.cv.subjects.join(', ')}</p>
                        <p>時薪: HKD {tutor.cv.sessionRate}/小時</p>
                        <p>經驗: {tutor.cv.teachingExperienceYears} 年</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/org/tutors/${tutor._id}/edit`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                      >
                        編輯
                      </Link>
                      <button
                        onClick={() => handleTogglePublic(tutor._id)}
                        className={`px-3 py-1 rounded text-sm ${
                          tutor.isPublic 
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        {tutor.isPublic ? '隱藏' : '公開'}
                      </button>
                      <button
                        onClick={() => handleDeleteTutor(tutor._id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 