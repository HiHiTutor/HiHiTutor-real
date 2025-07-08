'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArticleCard } from '@/components/ArticleCard'

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
  const [articles, setArticles] = useState<Article[]>([])
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    fetch(`${baseUrl}/api/articles`)
      .then((res) => res.json())
      .then((data) => {
        // 修正：如果沒有 author，但有 authorId，顯示『你』或『導師』
        const articles = data.map((a: any) => ({
          ...a,
          author: a.author || (a.authorId ? '你' : '未知作者'),
          date: a.date || a.createdAt || '2024-01-01',
          views: a.views || 0,
          featured: a.featured || false,
          coverImage: a.coverImage || 'https://source.unsplash.com/400x200/?education'
        }))
        setArticles(articles)
      })
      .catch((err) => console.error('文章載入失敗:', err))
  }, [])

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
    </div>
  )
} 