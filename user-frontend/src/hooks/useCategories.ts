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
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
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
