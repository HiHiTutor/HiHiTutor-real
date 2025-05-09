'use client'

import React from 'react'
import Link from 'next/link'

const mockArticles = [
  {
    id: '1',
    title: '小學英文作文 5 個高分句型',
    summary: '掌握這幾個句型，寫作立即升 Grade！立即學習如何應用。',
    author: 'Miss Chan',
    tags: ['小學', '英文', '寫作技巧'],
    featured: true,
  },
  {
    id: '2',
    title: 'DSE 數學奪星策略：必操 5 條題型',
    summary: 'DSE 想拎 5**？你一定要識呢幾條主題題型！',
    author: '導師 Kelvin',
    tags: ['DSE', '數學', '考試技巧'],
    featured: false,
  },
  {
    id: '3',
    title: '90 後導師專訪：3 年帶出 12 位星星生',
    summary: '從街坊補習走出高收生涯，他做對咗啲咩？',
    author: 'HiHiTutor 編輯部',
    tags: ['導師訪問', '品牌故事'],
    featured: true,
  },
]

export default function ArticlesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">教育專欄</h1>
      <div className="space-y-6">
        {mockArticles.map((article) => (
          <div
            key={article.id}
            className="p-5 border rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Link href={`/articles/${article.id}`}>
              <h2 className="text-xl font-semibold text-blue-700 hover:underline">
                {article.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-600 mt-1">作者：{article.author}</p>
            <p className="mt-2">{article.summary}</p>
            <div className="mt-2 text-sm text-gray-500">
              {article.tags.map((tag) => (
                <span key={tag} className="mr-2">#{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 