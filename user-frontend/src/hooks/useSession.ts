import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  userType: 'student' | 'tutor' | 'organization'
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          // 根據 response 結構自動判斷 user 物件
          if (data && data.id) {
            setUser(data);
          } else if (data && data.user && data.user.id) {
            setUser(data.user);
          } else if (data && data.data && data.data.id) {
            setUser(data.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading }
} 