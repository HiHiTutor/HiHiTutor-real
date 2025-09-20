import { useState, useEffect } from 'react';

export interface CategoryOption {
  value: string;
  label: string;
  subjects?: { value: string; label: string }[];
  subCategories?: {
    value: string;
    label: string;
    subjects: { value: string; label: string }[];
  }[];
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE}/api/categories`;
        console.log('🔍 正在載入科目資料，API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('📡 API 回應狀態:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ 載入科目資料成功:', data);
        setCategories(data);
      } catch (err) {
        console.error('❌ 載入科目資料失敗:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        // 如果API失敗，使用空數組
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
