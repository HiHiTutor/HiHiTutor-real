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
  authorId?: string | { _id: string; name: string; tutorId: string }
  date?: string
  tags?: string[]
  coverImage?: string
}

export default function ArticleDetail() {
  const params = useParams()
  const id = params?.id as string
  const [article, setArticle] = useState<Article | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    if (!id) return
    
    fetch(`${baseUrl}/api/articles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // 處理文章數據，確保時間格式正確
        const processedArticle = {
          ...data,
          author: data.authorId?.tutorId || data.author || '未知導師',
          date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('zh-HK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '未知時間'
        }
        setArticle(processedArticle)
      })
      .catch((err) => console.error('文章載入失敗:', err))
  }, [id, baseUrl])

  if (!id) return <div className="p-8">文章ID無效</div>
  if (!article) return <div className="p-8">載入中...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div className="text-sm text-gray-500 mb-2">
        ✍️ 作者：<a href={`/tutors/${typeof article.authorId === 'object' ? article.authorId.tutorId : article.authorId}`} className="text-blue-600 hover:underline">{article.author}</a>　🕒 發佈時間：{article.date || '未知'}
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