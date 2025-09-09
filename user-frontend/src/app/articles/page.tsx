'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { useUser } from '@/hooks/useUser'

interface Article {
  id: string
  title: string
  summary: string
  content: string
  author?: string
  authorId?: string
  date?: string
  createdAt?: string
  tags?: string[]
  coverImage?: string
  featured: boolean
  views: number
  status?: string
}

export default function ArticlesPage() {
  const { user } = useUser()
  const [articles, setArticles] = useState<Article[]>([])
  const [myArticles, setMyArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true)
        
        // 載入已審核的文章
        const res = await fetch(`${baseUrl}/api/articles`)
        const data = await res.json()
        
        const articles = data.map((a: any) => ({
          ...a,
          author: a.authorId?.tutorId || a.author || '未知導師',
          date: a.date || a.createdAt || '2024-01-01',
          views: a.views || 0,
          featured: a.featured || false,
          coverImage: a.coverImage || 'https://source.unsplash.com/400x200/?education'
        }))
        setArticles(articles)
        
        // 嘗試載入用戶自己的文章
        const token = localStorage.getItem('token')
        console.log('🔍 檢查用戶登入狀態:', { hasToken: !!token, user: user })
        
        if (token && user) {
          try {
            console.log('🔍 使用 useUser hook 獲取的用戶:', user)
            
            // 嘗試兩種 ID 格式
            let myRes = await fetch(`${baseUrl}/api/articles/my-articles?authorId=${user.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            // 如果第一個失敗，嘗試使用 userId
            if (!myRes.ok && user.userId) {
              console.log('🔍 嘗試使用 userId:', user.userId)
              myRes = await fetch(`${baseUrl}/api/articles/my-articles?authorId=${user.userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
            }
            
            console.log('🔍 我的文章 API 響應:', { status: myRes.status, ok: myRes.ok })
            
            if (myRes.ok) {
              const myData = await myRes.json()
              console.log('🔍 我的文章數據:', myData)
              
              const myArticles = myData.map((a: any) => ({
                ...a,
                author: a.authorId?.tutorId || a.author || '你',
                date: a.date || a.createdAt || '2024-01-01',
                views: a.views || 0,
                featured: a.featured || false,
                coverImage: a.coverImage || 'https://source.unsplash.com/400x200/?education'
              }))
              setMyArticles(myArticles)
              console.log('🔍 設置我的文章:', myArticles)
            } else {
              const errorData = await myRes.json().catch(() => ({}))
              console.error('❌ 載入我的文章失敗:', { status: myRes.status, error: errorData })
            }
          } catch (err) {
            console.error('❌ 載入用戶文章失敗:', err)
          }
        } else {
          console.log('🔍 沒有登入 token 或用戶信息:', { hasToken: !!token, hasUser: !!user })
        }
      } catch (err) {
        console.error('文章載入失敗:', err)
      } finally {
        setLoading(false)
      }
    }
    
    // 如果用戶還沒載入，等待一下再載入文章
    if (!user) {
      const timer = setTimeout(() => {
        loadArticles() // 即使沒有用戶也要載入公開文章
      }, 1000)
      return () => clearTimeout(timer)
    }
    
    loadArticles()
  }, [baseUrl, user])

  const featured = articles.filter((a) => a.featured)
  const latest = articles.filter((a) => !a.featured)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Banner + CTA */}
      <div className="bg-yellow-100 p-6 rounded-lg shadow mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">教育專欄</h1>
        <p className="text-gray-700 mb-4">學習技巧 ✦ 升學攻略 ✦ 導師專訪</p>
        <Link href="/articles/post">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            ✍️ 我要投稿
          </button>
        </Link>
      </div>

      {/* 🌟 精選導讀排最前 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">🌟 精選導讀</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              author={article.author || '未知作者'}
              summary={article.summary}
              image={article.coverImage}
              tags={article.tags}
              date={article.date || article.createdAt || '2024-01-01'}
              views={article.views || 0}
              highlight={article.featured}
            />
          ))}
        </div>
      </section>

      {/* 🆕 最新文章放第二 */}
      <section className="bg-white rounded-lg shadow p-4 mb-12">
        <h2 className="text-2xl font-semibold mb-4">🆕 最新文章</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latest.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              author={article.author || '未知作者'}
              summary={article.summary}
              image={article.coverImage}
              tags={article.tags}
              date={article.date || article.createdAt || '2024-01-01'}
              views={article.views || 0}
              highlight={article.featured}
            />
          ))}
        </div>
      </section>

      {/* 📝 我的文章 */}
      {myArticles.length > 0 && (
        <section className="bg-blue-50 rounded-lg shadow p-4 mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">📝 我的文章</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myArticles.map((article) => (
              <div key={article.id} className="relative">
                <ArticleCard
                  id={article.id}
                  title={article.title}
                  author={article.author || '你'}
                  summary={article.summary}
                  image={article.coverImage}
                  tags={article.tags}
                  date={article.date || article.createdAt || '2024-01-01'}
                  views={article.views || 0}
                  highlight={article.featured}
                />
                {/* 狀態標籤 */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  article.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {article.status === 'pending' ? '⏳ 待審核' :
                   article.status === 'approved' ? '✅ 已通過' :
                   '❌ 已拒絕'}
                </div>
                
                {/* 操作按鈕 */}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  {article.status === 'rejected' && (
                    <Link href={`/articles/edit/${article.id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition">
                        ✏️ 重新編輯
                      </button>
                    </Link>
                  )}
                  {article.status === 'approved' && (
                    <Link href={`/articles/edit/${article.id}`}>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition">
                        ✏️ 編輯更新
                      </button>
                    </Link>
                  )}
                  {article.status === 'pending' && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs">
                      ⏳ 審核中
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 調試信息 */}
      {process.env.NODE_ENV === 'development' && (
        <section className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">🔍 調試信息</h3>
          <div className="text-sm space-y-1">
            <p>載入狀態: {loading ? '載入中' : '完成'}</p>
            <p>文章總數: {articles.length}</p>
            <p>我的文章數: {myArticles.length}</p>
            <p>Token: {localStorage.getItem('token') ? '存在' : '不存在'}</p>
            <p>useUser Hook 狀態: {user ? `已載入 (ID: ${user.id})` : '未載入'}</p>
            <p>用戶類型: {user?.userType || '未知'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
            >
              🔄 強制刷新頁面
            </button>
          </div>
        </section>
      )}

      {/* 載入中提示 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      )}
    </div>
  )
} 