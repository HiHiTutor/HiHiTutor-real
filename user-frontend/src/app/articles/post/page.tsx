'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ArticleForm from '@/components/ArticleForm'

export default function ArticlePostPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 直接從 localStorage 檢查用戶狀態
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (!token || !userData) {
        // 未登入 ➝ 跳轉至登入頁，並保存目標頁面
        router.replace('/login?redirect=/articles/post')
        return
      }

      try {
        const user = JSON.parse(userData)
        if (user.userType !== 'tutor') {
          // 已登入但不是導師 ➝ 跳去升級頁並提示
          alert('只有導師可以投稿文章，請先升級為導師')
          router.replace('/upgrade')
          return
        }
        
        // 用戶是導師，允許訪問
        setIsAuthorized(true)
             } catch (error) {
         console.error('解析用戶資料失敗:', error)
         router.replace('/login?redirect=/articles/post')
       }
    }

    // 立即檢查
    checkAuth()
    setIsLoading(false)
  }, [router])

  if (isLoading || !isAuthorized) return null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">撰寫文章</h1>
      <ArticleForm />
    </div>
  )
} 