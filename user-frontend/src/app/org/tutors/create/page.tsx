'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TutorFormData {
  tutorName: string
  tutorEmail: string
  tutorPhone: string
  cv: {
    subjects: string[]
    sessionRate: number
    introduction: string
    educationLevel: string
    teachingExperienceYears: number
    gender: 'male' | 'female'
    teachingAreas: string[]
    teachingMethods: string[]
    qualifications: string[]
    availableTime: Array<{ day: string; time: string }>
  }
}

const subjects = [
  '中文', '英文', '數學', '物理', '化學', '生物', '歷史', '地理', 
  '經濟', '會計', '電腦', '音樂', '美術', '體育', '其他'
]

const teachingAreas = [
  '港島區', '九龍區', '新界區', '離島區', '網上教學'
]

const teachingMethods = [
  '面對面', '網上教學', '混合模式'
]

export default function CreateTutor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TutorFormData>({
    tutorName: '',
    tutorEmail: '',
    tutorPhone: '',
    cv: {
      subjects: [],
      sessionRate: 100,
      introduction: '',
      educationLevel: '',
      teachingExperienceYears: 0,
      gender: 'male',
      teachingAreas: [],
      teachingMethods: [],
      qualifications: [],
      availableTime: []
    }
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof TutorFormData] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    const currentArray = formData.cv[field as keyof typeof formData.cv] as string[]
    
    if (action === 'add' && !currentArray.includes(value)) {
      handleInputChange(`cv.${field}`, [...currentArray, value])
    } else if (action === 'remove') {
      handleInputChange(`cv.${field}`, currentArray.filter(item => item !== value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/organization-tutors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('導師創建成功！')
        router.push('/org/dashboard')
      } else {
        const errorData = await response.json()
        alert(`創建失敗: ${errorData.message}`)
      }
    } catch (error) {
      console.error('創建導師失敗:', error)
      alert('創建失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/org/dashboard"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← 返回儀表板
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">添加新導師</h1>
          <p className="mt-2 text-gray-600">為您的機構添加新的導師CV</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* 基本信息 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  導師姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tutorName}
                  onChange={(e) => handleInputChange('tutorName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件 *
                </label>
                <input
                  type="email"
                  required
                  value={formData.tutorEmail}
                  onChange={(e) => handleInputChange('tutorEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話號碼 *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.tutorPhone}
                  onChange={(e) => handleInputChange('tutorPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select
                  value={formData.cv.gender}
                  onChange={(e) => handleInputChange('cv.gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
            </div>
          </div>

          {/* 教學信息 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教學信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時薪 (HKD) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={formData.cv.sessionRate}
                  onChange={(e) => handleInputChange('cv.sessionRate', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  教學經驗 (年)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cv.teachingExperienceYears}
                  onChange={(e) => handleInputChange('cv.teachingExperienceYears', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                可教授科目 *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {subjects.map((subject) => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cv.subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleArrayChange('subjects', subject, 'add')
                        } else {
                          handleArrayChange('subjects', subject, 'remove')
                        }
                      }}
                      className="mr-2"
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教學地區
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {teachingAreas.map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cv.teachingAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleArrayChange('teachingAreas', area, 'add')
                        } else {
                          handleArrayChange('teachingAreas', area, 'remove')
                        }
                      }}
                      className="mr-2"
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教學方式
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {teachingMethods.map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cv.teachingMethods.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleArrayChange('teachingMethods', method, 'add')
                        } else {
                          handleArrayChange('teachingMethods', method, 'remove')
                        }
                      }}
                      className="mr-2"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 詳細信息 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">詳細信息</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                學歷
              </label>
              <input
                type="text"
                value={formData.cv.educationLevel}
                onChange={(e) => handleInputChange('cv.educationLevel', e.target.value)}
                placeholder="例如：大學畢業、碩士學位等"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個人介紹
              </label>
              <textarea
                rows={4}
                value={formData.cv.introduction}
                onChange={(e) => handleInputChange('cv.introduction', e.target.value)}
                placeholder="請介紹導師的教學經驗、專長等"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                專業資格
              </label>
              <textarea
                rows={3}
                value={formData.cv.qualifications.join('\n')}
                onChange={(e) => handleInputChange('cv.qualifications', e.target.value.split('\n').filter(line => line.trim()))}
                placeholder="每行一個資格，例如：&#10;教師資格證&#10;相關專業證書"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/org/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '創建中...' : '創建導師'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 