'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export default function ArticleForm() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      summary: formData.get('summary'),
      content: formData.get('content'),
      tags: formData.get('tags')?.toString().split(',').map(t => t.trim()),
      authorId: user?.id,
    }

    console.log('🔍 提交文章數據:', data)
    console.log('🔍 用戶信息:', user)
    console.log('🔍 API URL:', `${process.env.NEXT_PUBLIC_API_BASE}/api/articles/submit`)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/articles/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ 提交失敗:', res.status, res.statusText, errorData)
        throw new Error(`提交失敗: ${res.status} ${res.statusText}`)
      }

      const result = await res.json()
      console.log('✅ 提交成功:', result)
      router.push('/articles')
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          標題
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
          摘要
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          內容
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          標籤（用逗號分隔）
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          placeholder="英文, 寫作, 考試技巧"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '提交中...' : '提交文章'}
        </button>
      </div>
    </form>
  )
} 