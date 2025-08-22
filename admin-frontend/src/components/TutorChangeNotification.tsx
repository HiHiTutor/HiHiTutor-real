import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle, 
  Button, 
  Box,
  Typography,
  Chip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

interface TutorChangeNotificationProps {
  onClose?: () => void;
}

interface TutorChange {
  tutorId: string;
  name: string;
  email: string;
  change: {
    timestamp: string;
    fields: string[];
    newValues: any;
  };
}

const TutorChangeNotification: React.FC<TutorChangeNotificationProps> = ({ onClose }) => {
  const [open, setOpen] = useState(false);
  const [recentChanges, setRecentChanges] = useState<TutorChange[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 檢查是否在導師修改監控頁面
  const isOnTutorChangeMonitor = location.pathname === '/tutor-change-monitor';

  // 當進入導師修改監控頁面時，自動標記所有通知為已讀
  useEffect(() => {
    if (isOnTutorChangeMonitor) {
      console.log('🔔 進入導師修改監控頁面，自動標記所有通知為已讀');
      // 強制清除所有通知狀態
      setOpen(false);
      setRecentChanges([]);
      // 清除 localStorage 中的通知狀態
      localStorage.removeItem('tutorChangeReadStatus');
      // 通知父組件更新徽章數量
      if (onClose) {
        onClose();
      }
    }
  }, [isOnTutorChangeMonitor, onClose]);

  // 監聽路由變化，當離開導師修改監控頁面時重新啟用通知
  useEffect(() => {
    const handleRouteChange = () => {
      if (!isOnTutorChangeMonitor && recentChanges.length === 0) {
        console.log('🔔 離開導師修改監控頁面，重新啟用通知檢查');
        // 延遲一下再重新獲取通知，避免立即彈出
        setTimeout(() => {
          fetchRecentChanges();
        }, 1000);
      }
    };

    // 使用 setTimeout 來檢測路由變化
    const timer = setTimeout(handleRouteChange, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, isOnTutorChangeMonitor, recentChanges.length]);

  const fetchRecentChanges = async () => {
    // 如果已經在導師修改監控頁面，不需要獲取通知
    if (isOnTutorChangeMonitor) {
      console.log('🔔 已在導師修改監控頁面，跳過通知獲取');
      return;
    }

    try {
      console.log('🔔 TutorChangeNotification: 開始獲取最近修改記錄...');
      setLoading(true);
      const response = await api.get('/admin/notifications/recent-changes?limit=5');
      console.log('🔔 API 響應:', response.data);
      
      if (response.data.success) {
        const newChanges = response.data.data;
        setRecentChanges(newChanges);
        console.log('🔔 獲取到修改記錄:', newChanges);
        
        // 如果有修改記錄，顯示通知
        if (newChanges.length > 0) {
          console.log('🔔 發現修改記錄，觸發通知彈出');
          setOpen(true);
        } else {
          console.log('🔔 沒有修改記錄');
          setOpen(false);
        }
      } else {
        console.log('🔔 API 返回失敗:', response.data);
      }
    } catch (error) {
      console.error('🔔 獲取最近修改記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔔 TutorChangeNotification: 組件已掛載，開始初始化...');
    
    // 如果不在導師修改監控頁面，才開始獲取通知
    if (!isOnTutorChangeMonitor) {
      // 初始檢查
      fetchRecentChanges();
      
      // 每 30 秒檢查一次新的修改記錄
      const interval = setInterval(() => {
        console.log('🔔 定期檢查新的修改記錄...');
        fetchRecentChanges();
      }, 30000);
      
      return () => {
        console.log('🔔 清理定時器');
        clearInterval(interval);
      };
    }
  }, [isOnTutorChangeMonitor]);

  // 調試渲染
  console.log('🔔 TutorChangeNotification 渲染:', { 
    open, 
    recentChanges: recentChanges.length, 
    loading,
    isOnTutorChangeMonitor
  });

  const handleClose = () => {
    console.log('🔔 手動關閉通知');
    setOpen(false);
    onClose?.();
  };

  const handleViewDetails = () => {
    console.log('🔔 點擊查看詳情，關閉通知');
    // 關閉通知
    setOpen(false);
    onClose?.();
    
    // 跳轉到導師修改監控頁面
    navigate('/tutor-change-monitor');
  };

  const handleMarkAsRead = () => {
    console.log('🔔 點擊標記為已讀，關閉通知');
    // 關閉通知
    setOpen(false);
    onClose?.();
  };

  // 如果在導師修改監控頁面，不顯示任何內容
  if (isOnTutorChangeMonitor) {
    console.log('🔔 在導師修改監控頁面，不顯示通知');
    return null;
  }

  // 如果沒有修改記錄或通知已關閉，不顯示通知
  if (recentChanges.length === 0 || !open) {
    console.log('🔔 沒有修改記錄或通知已關閉，不顯示通知');
    return null;
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} 小時前`;
    return `${Math.floor(diffInMinutes / 1440)} 天前`;
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      'tutorProfile.introduction': '自我介紹',
      'tutorProfile.courseFeatures': '課程特色',
      'tutorProfile.subjects': '教學科目',
      'tutorProfile.sessionRate': '課時費',
      'tutorProfile.teachingMode': '教學模式',
      'tutorProfile.region': '教學地區',
      'tutorProfile.category': '課程分類',
      'tutorProfile.teachingExperienceYears': '教學經驗年數',
      'tutorProfile.qualifications': '學歷資格',
      'tutorProfile.examResults': '考試成績',
      'tutorProfile.teachingAreas': '教學領域',
      'tutorProfile.availableTime': '可授課時間',
      'tutorProfile.teachingMethods': '教學方法',
      'tutorProfile.classType': '課程類型',
      'tutorProfile.publicCertificates': '公開證書',
      'tutorProfile.documents': '相關文件'
    };
    
    return fieldMap[field] || field;
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ maxWidth: 400 }}
    >
      <Alert 
        severity="info" 
        onClose={handleClose}
        icon={<NotificationsIcon />}
        sx={{ width: '100%' }}
      >
        <AlertTitle>導師資料修改通知</AlertTitle>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            發現 {recentChanges.length} 個新的導師資料修改：
          </Typography>
          
          {recentChanges.slice(0, 3).map((change, index) => (
            <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {change.name} ({change.tutorId})
                </Typography>
                <Chip 
                  label={formatTimestamp(change.change.timestamp)} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {change.change.fields.slice(0, 3).map((field, fieldIndex) => (
                  <Chip
                    key={fieldIndex}
                    label={getFieldDisplayName(field)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {change.change.fields.length > 3 && (
                  <Chip
                    label={`+${change.change.fields.length - 3} 更多`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          ))}
          
          {recentChanges.length > 3 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              還有 {recentChanges.length - 3} 個修改記錄...
            </Typography>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handleViewDetails}
            >
              查看詳情
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleMarkAsRead}
            >
              稍後查看
            </Button>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default TutorChangeNotification;