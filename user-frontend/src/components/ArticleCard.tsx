'use client'
import React from 'react'
import Link from 'next/link'
import { getColorClassByTag } from '@/utils/colorPalette'

interface ArticleCardProps {
  id: string
  title: string
  author: string
  authorId?: string
  summary: string
  image?: string
  tags?: string[]
  date: string
  views: number
  highlight?: boolean
}

export const ArticleCard = ({
  id,
  title,
  author,
  authorId,
  summary,
  image,
  tags = [],
  date,
  views,
  highlight = false,
}: ArticleCardProps) => {
  const color = getColorClassByTag(tags[0] || '其他')
  const imgSrc = image || 'https://source.unsplash.com/400x200/?education'

  return (
    <div className={`min-h-[320px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${color.bg} relative`}>
      {highlight && (
        <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded">
          精選
        </span>
      )}
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-40 object-cover rounded-t-xl"
        onError={(e) => {
          e.currentTarget.src = 'https://source.unsplash.com/400x200/?classroom'
        }}
      />
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <Link href={`/articles/${id}`}>
            <h3 className={`text-lg font-bold ${color.text} hover:underline`}>{title}</h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            ✍️ {authorId ? (
              <Link href={`/tutors/${authorId}`} className="text-blue-600 hover:underline">
                {author}
              </Link>
            ) : (
              author
            )}
          </p>
          <p className="text-gray-700 mt-2 line-clamp-3">{summary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, idx) => {
              const c = getColorClassByTag(tag)
              return (
                <span key={idx} className={`px-2 py-1 text-xs rounded-full ${c.bg} ${c.text}`}>
                  #{tag}
                </span>
              )
            })}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            🕒 發佈：{date}　👁️ {views.toLocaleString()}
          </p>
        </div>
        <Link
          href={`/articles/${id}`}
          className={`inline-block mt-4 ${color.text} hover:underline`}
        >
          閱讀全文 →
        </Link>
      </div>
    </div>
  )
} 