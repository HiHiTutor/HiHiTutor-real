import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';
const API_URL = `${API_BASE_URL}/ads`;

const typeMap = {
  'hero': 'Hero',
  'sidebar-left': 'Sidebar-Left',
  'sidebar-right': 'Sidebar-Right',
  'footer-left': 'Footer-Left',
  'footer-right': 'Footer-Right',
};

export default function AdManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(API_URL, {
        headers
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setAds(data);
      setError('');
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('讀取失敗');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這個廣告？')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      fetchAds();
    } catch (err) {
      console.error('Error deleting ad:', err);
      alert('刪除失敗');
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/${id}/toggle`, { 
        method: 'PATCH',
        headers
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      fetchAds();
    } catch (err) {
      console.error('Error toggling ad:', err);
      alert('切換狀態失敗');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>廣告管理</h1>
      <button
        style={{ marginBottom: 20, background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        onClick={() => window.location.href = '/ad-create'}
      >
        ➕ 新增廣告
      </button>
      {loading ? (
        <div>載入中...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>類型</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>標題</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>圖片</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>連結</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>啟用</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad._id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{typeMap[ad.type] || ad.type}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{ad.title}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  {ad.imageUrl ? <img src={ad.imageUrl} alt="ad" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : <span style={{ color: '#aaa' }}>無</span>}
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  {ad.link ? <a href={ad.link} target="_blank" rel="noopener noreferrer">{ad.link}</a> : <span style={{ color: '#aaa' }}>無</span>}
                </td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                  <button onClick={() => handleToggle(ad._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
                    {ad.isActive ? '✅' : '❌'}
                  </button>
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <button onClick={() => window.location.href = `/ad-edit/${ad._id}`} style={{ marginRight: 8, background: '#fbbf24', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>✏️ 編輯</button>
                  <button onClick={() => handleDelete(ad._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>🗑️ 刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 