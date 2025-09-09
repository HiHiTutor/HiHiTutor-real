'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

interface Article {
  _id: string
  title: string
  summary: string
  content: string
  tags: string[]
  authorId: string
  status: string
}

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [article, setArticle] = useState<Article | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [coverImage, setCoverImage] = useState<string>('')

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
      formData.append('articleId', params?.id as string)

      const response = await fetch(`${API_BASE}/api/article-upload/cover-image`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // 處理圖片 URL
        let imageUrl = result.url;
        if (result.file && result.file.path && !result.url.startsWith('http')) {
          // 本地文件，構建完整 URL
          imageUrl = `${API_BASE}${result.url}`;
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
  
  // Early return if no params or id
  if (!params?.id) {
    return <div className="p-8">文章ID無效</div>
  }
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: ''
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE

  useEffect(() => {
    if (params?.id && user) {
      loadArticle()
    }
  }, [params?.id, user])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('請先登入')
        return
      }

      const response = await fetch(`${API_BASE}/api/articles/${params?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('載入文章失敗')
      }

      const data = await response.json()
      
      // 檢查是否是作者本人 - 處理 authorId 可能是對象的情況
      let authorId = data.authorId
      if (typeof authorId === 'object' && authorId !== null) {
        authorId = authorId._id || authorId.id
      }
      
      const isAuthor = authorId === user?.id || authorId === user?.userId
      if (!isAuthor) {
        console.log('🔍 權限檢查失敗:', { 
          articleAuthorId: data.authorId,
          extractedAuthorId: authorId,
          userID: user?.id, 
          userUserId: user?.userId 
        })
        setError('您只能編輯自己的文章')
        return
      }

      setArticle(data)
      setFormData({
        title: data.title,
        summary: data.summary,
        content: data.content,
        tags: data.tags?.join(', ') || ''
      })
      setCoverImage(data.coverImage || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入文章失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!article) return

    try {
      setSubmitting(true)
      setError('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('請先登入')
        return
      }

      const data = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        coverImage: uploadedImageUrl || coverImage || 'https://source.unsplash.com/400x200/?education',
        authorId: user?.id,
        originalArticleId: article._id // 標記這是編輯的文章
      }

      const response = await fetch(`${API_BASE}/api/articles/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '提交失敗')
      }

      const result = await response.json()
      
      // 顯示成功提示
      alert('✅ 文章更新成功！管理員將重新審核您的文章。')
      
      // 跳轉回文章列表
      router.push('/articles')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">載入失敗</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/articles')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            返回文章列表
          </button>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">文章不存在</h2>
          <button
            onClick={() => router.push('/articles')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            返回文章列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">編輯文章</h1>
        <p className="text-gray-600">
          編輯您的文章「{article.title}」。編輯後將作為新文章提交，需要重新審核。
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="text-blue-600 mr-2">ℹ️</div>
          <div className="text-blue-800">
            <strong>注意：</strong>編輯文章後，原文章將保持不變，新版本將作為新文章提交審核。
            這樣可以保持文章歷史記錄的完整性。
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            標題 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="輸入文章標題"
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
            摘要 *
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="簡要描述文章內容"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            內容 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="輸入文章詳細內容"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            標籤
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="用逗號分隔多個標籤，例如：英文, 寫作, 考試技巧"
          />
          <p className="mt-1 text-sm text-gray-500">
            標籤幫助讀者更容易找到您的文章
          </p>
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
            封面圖片（可選）
          </label>
          
          {/* 圖片上傳按鈕 */}
          <div className="mb-2">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => router.push('/articles')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            取消
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? '提交中...' : '提交更新'}
          </button>
        </div>
      </form>
    </div>
  )
}
