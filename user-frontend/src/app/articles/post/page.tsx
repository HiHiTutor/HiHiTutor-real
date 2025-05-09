'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import ArticleForm from '@/components/ArticleForm'

export default function ArticlePostPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // 等資料載入完成先做判斷

    if (!user) {
      // 未登入 ➝ 跳轉至登入頁
      router.push('/login')
    } else if (user.role !== 'tutor') {
      // 已登入但不是導師 ➝ 跳去升級頁並提示
      alert('只有導師可以投稿文章，請先升級為導師')
      router.push('/upgrade')
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== 'tutor') return null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">撰寫文章</h1>
      <ArticleForm />
    </div>
  )
} 