import React, { useEffect, useState } from 'react';

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

export default function AdEdit() {
  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    imageUrl: '',
    bgColor: '#2563eb',
    link: '',
    isActive: true,
    buttonText: '了解更多',
    buttonColor: '#2563eb',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // 取得 id
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    async function fetchAd() {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/${id}`, { headers });
        if (!res.ok) throw new Error('讀取失敗');
        const data = await res.json();
        setForm({
          type: data.type || '',
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          bgColor: data.bgColor || '#2563eb',
          link: data.link || '',
          isActive: data.isActive ?? true,
          buttonText: data.buttonText || '了解更多',
          buttonColor: data.buttonColor || '#2563eb',
        });
        setError('');
      } catch (err) {
        setError('讀取失敗');
      }
      setLoading(false);
    }
    fetchAd();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'ad'); // 新增這行，讓後端知道這是廣告圖
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        alert('圖片上傳失敗');
      }
    } catch (err) {
      alert('圖片上傳失敗');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('儲存失敗');
      window.location.href = '/AdManager';
    } catch (err) {
      setError('儲存失敗');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 40 }}>載入中...</div>;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>編輯廣告</h1>
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
          <label>描述：</label>
          <textarea name="description" value={form.description} onChange={handleChange} style={{ width: '100%', padding: 8, minHeight: 80 }} placeholder="例如：我們提供專業的導師配對服務，幫助你找到最適合的學習夥伴" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>圖片：</label>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            建議尺寸：Hero (1200x400px), MainBanner (800x200px), Sidebar (300x250px), Footer (200x100px)
          </div>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="https://example.com/image.jpg" />
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ marginBottom: 8 }} />
          {uploading && <div style={{ color: '#888', marginBottom: 8 }}>圖片上傳中...</div>}
          {form.imageUrl && (
            <div style={{ marginBottom: 8 }}>
              <img src={form.imageUrl} alt="預覽" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6, border: '1px solid #eee' }} />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))} style={{ marginLeft: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>移除圖片</button>
            </div>
          )}
          {!form.imageUrl && (
            <div style={{ marginTop: 8 }}>
              <label>背景顏色：</label>
              <input type="color" value={form.bgColor} onChange={e => setForm(prev => ({ ...prev, bgColor: e.target.value }))} style={{ width: 50, height: 40, border: '1px solid #ccc', cursor: 'pointer', marginLeft: 8 }} />
            </div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>連結：</label>
          <input name="link" value={form.link} onChange={handleChange} style={{ width: '100%', padding: 8 }} placeholder="https://example.com" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> 啟用
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>按鈕文字：</label>
          <input name="buttonText" value={form.buttonText} onChange={handleChange} style={{ width: '100%', padding: 8 }} placeholder="例如：立即開始" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>按鈕顏色：</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input name="buttonColor" value={form.buttonColor} onChange={handleChange} style={{ width: '100%', padding: 8 }} placeholder="#2563eb" />
            <input type="color" value={form.buttonColor} onChange={(e) => setForm(prev => ({ ...prev, buttonColor: e.target.value }))} style={{ width: 50, height: 40, border: '1px solid #ccc', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, buttonColor: color }))}
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: color,
                  border: form.buttonColor === color ? '3px solid #000' : '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
                title={color}
              />
            ))}
          </div>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {saving ? '儲存中...' : '儲存'}
        </button>
        <button type="button" onClick={() => window.location.href = '/AdManager'} style={{ marginLeft: 12, padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>
          返回
        </button>
      </form>
    </div>
  );
} 