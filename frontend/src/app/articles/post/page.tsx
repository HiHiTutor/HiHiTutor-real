'use client'

import React, { useState } from 'react'

export default function PostArticlePage() {
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    author: '',
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setMessage(data.message || '投稿完成')
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">我要投稿</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="author" placeholder="你的名字" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="title" placeholder="文章標題" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="summary" placeholder="摘要（可短寫）" onChange={handleChange} required className="w-full border p-2 rounded" />
        <textarea name="content" placeholder="文章內容（可使用 HTML 格式）" onChange={handleChange} required className="w-full border p-2 h-40 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">送出</button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  )
} 