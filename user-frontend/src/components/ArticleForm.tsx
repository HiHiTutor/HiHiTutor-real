'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export default function ArticleForm() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coverImage, setCoverImage] = useState<string>('')

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
      coverImage: coverImage || 'https://source.unsplash.com/400x200/?education',
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
      
      // 顯示成功提示
      setError('') // 清除錯誤
      
      // 創建成功提示元素
      const successDiv = document.createElement('div')
      successDiv.className = 'bg-green-50 text-green-700 p-4 rounded-md mb-4'
      successDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-medium">✅ 文章投稿成功！</span>
        </div>
        <p class="mt-2 text-sm">管理員將盡快審核您的文章。審核通過後，文章將在專欄中顯示。</p>
      `
      
      // 插入到表單前面
      const form = document.querySelector('form')
      if (form && form.parentNode) {
        form.parentNode.insertBefore(successDiv, form)
        
        // 清空表單
        form.reset()
      }
      
      // 延遲跳轉，讓用戶看到成功提示
      setTimeout(() => {
        router.push('/articles')
      }, 3000)
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

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
          封面圖片 URL（可選）
        </label>
        <input
          type="url"
          id="coverImage"
          name="coverImage"
          placeholder="https://example.com/image.jpg"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          如果沒有提供圖片，系統將自動使用預設圖片
        </p>
        {coverImage && (
          <div className="mt-2">
            <img 
              src={coverImage} 
              alt="預覽" 
              className="w-32 h-20 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
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