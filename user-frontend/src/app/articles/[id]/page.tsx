'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  summary: string
  content: string
  author: string
  date?: string
  tags?: string[]
  coverImage?: string
}

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

  useEffect(() => {
    fetch(`${baseUrl}/api/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch((err) => console.error('文章載入失敗:', err))
  }, [id])

  if (!article) return <div className="p-8">載入中...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div className="text-sm text-gray-500 mb-2">
        ✍️ 作者：{article.author}　🕒 發佈時間：{article.date || '未知'}
      </div>
      <div className="mb-4">
        {article.tags?.map((tag, idx) => (
          <span key={idx} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 mr-2 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: article.content }} className="prose max-w-full" />
      <Link href="/articles" className="inline-block mt-6 text-blue-600 hover:underline">← 返回文章列表</Link>
    </div>
  )
} 