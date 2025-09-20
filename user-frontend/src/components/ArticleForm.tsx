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
  const [uploading, setUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')

  // 處理圖片上傳
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片文件')
      return
    }

    // 檢查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('coverImage', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/article-upload/cover-image`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // 處理圖片 URL
        let imageUrl = result.url;
        if (result.file && result.file.path && !result.url.startsWith('http')) {
          // 本地文件，構建完整 URL
          imageUrl = `${process.env.NEXT_PUBLIC_API_BASE}${result.url}`;
        }
        
        setUploadedImageUrl(imageUrl)
        setCoverImage(imageUrl)
        console.log('✅ 圖片上傳成功:', imageUrl)
      } else {
        setError(result.message || '圖片上傳失敗')
      }
    } catch (err) {
      console.error('❌ 圖片上傳失敗:', err)
      setError('圖片上傳失敗，請重試')
    } finally {
      setUploading(false)
    }
  }

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
      coverImage: uploadedImageUrl || coverImage || 'https://source.unsplash.com/400x200/?education',
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
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
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
          封面圖片（可選）
        </label>
        
        {/* 圖片上傳按鈕 */}
        <div className="mt-1">
          <input
            type="file"
            id="coverImage"
            name="coverImage"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {uploading && (
            <p className="mt-2 text-sm text-blue-600">📤 上傳中...</p>
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-500">
          支援 JPG、PNG、GIF 格式，最大 5MB
        </p>
        
        {/* 圖片預覽 */}
        {(uploadedImageUrl || coverImage) && (
          <div className="mt-2">
            <img
              src={uploadedImageUrl || coverImage}
              alt="預覽"
              className="w-32 h-20 object-cover rounded border"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p className="mt-1 text-xs text-green-600">✅ 圖片已上傳</p>
          </div>
        )}
        
        {/* 備用 URL 輸入 */}
        <div className="mt-4">
          <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-600">
            或輸入圖片 URL：
          </label>
          <input
            type="url"
            id="coverImageUrl"
            name="coverImageUrl"
            placeholder="https://example.com/image.jpg"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
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