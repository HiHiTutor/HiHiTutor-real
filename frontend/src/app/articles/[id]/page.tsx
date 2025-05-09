'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
  }, [id])

  if (!article) return <p className="p-4">載入中...</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-600 mb-2">作者：{article.author}</p>
      <p className="mb-6 text-gray-700">{article.summary}</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  )
} 