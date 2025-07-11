import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';
const API_URL = `${API_BASE_URL}/ads`;

const typeOptions = [
  { value: 'hero', label: 'Hero' },
  { value: 'main-banner', label: 'MainBanner' },
  { value: 'sidebar-left', label: 'Sidebar-Left' },
  { value: 'sidebar-right', label: 'Sidebar-Right' },
  { value: 'footer-left', label: 'Footer-Left' },
  { value: 'footer-right', label: 'Footer-Right' },
];

export default function AdCreate() {
  const [form, setForm] = useState({
    type: '',
    title: '',
    imageUrl: '',
    link: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('新增失敗');
      window.location.href = '/AdManager';
    } catch (err) {
      setError('新增失敗');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>新增廣告</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>類型：</label>
          <select name="type" value={form.type} onChange={handleChange} required style={{ width: '100%', padding: 8 }}>
            <option value="">請選擇</option>
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>標題：</label>
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>圖片網址：</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>連結：</label>
          <input name="link" value={form.link} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> 啟用
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? '新增中...' : '新增'}
        </button>
        <button type="button" onClick={() => window.location.href = '/AdManager'} style={{ marginLeft: 12, padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>
          返回
        </button>
      </form>
    </div>
  );
} 