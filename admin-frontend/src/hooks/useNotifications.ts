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
      const notificationsResponse = await api.get('/admin/notifications');
      
      // 獲取導師修改通知數據
      const tutorChangesResponse = await api.get('/admin/notifications/recent-changes?limit=1');
      
      if (notificationsResponse.data.success) {
        const baseNotifications = notificationsResponse.data.data;
        
        // 計算導師修改通知數量
        let tutorChangesCount = 0;
        if (tutorChangesResponse.data.success) {
          // 獲取最近24小時內的修改記錄數量
          const recentChangesResponse = await api.get('/admin/notifications/tutor-changes?page=1&limit=100');
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
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
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
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // 每 30 秒更新一次通知數據
    const interval = setInterval(fetchNotifications, 30000);
    
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