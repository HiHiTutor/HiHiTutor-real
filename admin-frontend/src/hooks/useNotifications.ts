import { useState, useEffect } from 'react';
import api from '../services/api';

export interface NotificationData {
  total: number;
  pendingTutorProfiles: number;
  pendingTutorApplications: number;
  pendingUserUpgrades: number;
  pendingOrganizationUsers: number;
  openCases: number;
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
      
      const response = await api.get('/admin/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.data);
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
    refetch: fetchNotifications
  };
}; 