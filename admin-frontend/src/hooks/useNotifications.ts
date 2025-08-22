import { useState, useEffect } from 'react';
import api from '../services/api';

export interface NotificationData {
  total: number;
  pendingTutorProfiles: number;
  pendingTutorApplications: number;
  pendingUserUpgrades: number;
  openCases: number;
  tutorChanges: number; // 新增：導師修改通知數量
  lastUpdated: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 獲取基本通知數據
      const notificationsResponse = await api.get('/admin/notifications', {
        timeout: 10000 // 設置10秒超時
      });
      
      // 獲取導師修改通知數據
      const tutorChangesResponse = await api.get('/admin/notifications/recent-changes?limit=1', {
        timeout: 10000 // 設置10秒超時
      });
      
      if (notificationsResponse.data.success) {
        const baseNotifications = notificationsResponse.data.data;
        
        // 計算導師修改通知數量
        let tutorChangesCount = 0;
        if (tutorChangesResponse.data.success) {
          // 獲取最近24小時內的修改記錄數量
          const recentChangesResponse = await api.get('/admin/notifications/tutor-changes?page=1&limit=100', {
            timeout: 15000 // 設置15秒超時
          });
          if (recentChangesResponse.data.success) {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            recentChangesResponse.data.data.forEach((tutor: any) => {
              tutor.changes.forEach((change: any) => {
                if (new Date(change.timestamp) > oneDayAgo) {
                  tutorChangesCount++;
                }
              });
            });
          }
        }
        
        const enhancedNotifications = {
          ...baseNotifications,
          tutorChanges: tutorChangesCount,
          total: baseNotifications.total + tutorChangesCount
        };
        
        setNotifications(enhancedNotifications);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      
      // 處理不同的錯誤類型
      if (err.code === 'ECONNABORTED') {
        setError('請求超時，請檢查網絡連接');
      } else if (err.response?.status === 401) {
        setError('未授權，請重新登入');
      } else if (err.response?.status === 403) {
        setError('權限不足');
      } else if (err.message === 'Network Error') {
        setError('網絡錯誤，請檢查網絡連接');
      } else {
        setError('獲取通知失敗，請稍後重試');
      }
    } finally {
      setLoading(false);
    }
  };

  // 清除導師修改通知
  const clearTutorChangeNotifications = () => {
    if (notifications) {
      const updatedNotifications = {
        ...notifications,
        tutorChanges: 0,
        total: notifications.total - notifications.tutorChanges
      };
      setNotifications(updatedNotifications);
      console.log('🔔 已清除導師修改通知，徽章數量重置為 0');
      
      // 強制重新獲取數據以確保同步
      setTimeout(() => {
        fetchNotifications();
      }, 100);
    }
  };

  useEffect(() => {
    // 檢查是否有有效的認證 token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔔 未找到認證 token，跳過通知獲取');
      return;
    }

    fetchNotifications();
    
    // 每 30 秒更新一次通知數據
    const interval = setInterval(() => {
      // 再次檢查 token 是否有效
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        fetchNotifications();
      } else {
        console.log('🔔 Token 已失效，停止通知更新');
        clearInterval(interval);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    clearTutorChangeNotifications
  };
}; 