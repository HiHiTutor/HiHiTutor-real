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
import { useNavigate } from 'react-router-dom';
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

  const fetchRecentChanges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/notifications/recent-changes?limit=5');
      if (response.data.success) {
        setRecentChanges(response.data.data);
        // 如果有新的修改記錄，顯示通知
        if (response.data.data.length > 0) {
          setOpen(true);
        }
      }
    } catch (error) {
      console.error('獲取最近修改記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始檢查
    fetchRecentChanges();
    
    // 每 30 秒檢查一次新的修改記錄
    const interval = setInterval(fetchRecentChanges, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleViewDetails = () => {
    navigate('/tutor-change-monitor');
    setOpen(false);
  };

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

  if (recentChanges.length === 0) return null;

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
              onClick={handleClose}
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
