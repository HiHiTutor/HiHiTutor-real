import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../services/api';

const NotificationTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testNotificationAPI = async () => {
    setLoading(true);
    setError(null);
    const results: any[] = [];

    try {
      // 測試 1: 基本通知端點
      console.log('🧪 測試 1: 基本通知端點');
      try {
        const response = await api.get('/admin/notifications');
        results.push({
          test: '基本通知端點',
          success: response.data.success,
          data: response.data.data,
          status: '✅ 成功'
        });
        console.log('✅ 基本通知端點測試成功:', response.data);
      } catch (err: any) {
        results.push({
          test: '基本通知端點',
          success: false,
          error: err.message,
          status: '❌ 失敗'
        });
        console.error('❌ 基本通知端點測試失敗:', err);
      }

      // 測試 2: 最近修改記錄端點
      console.log('🧪 測試 2: 最近修改記錄端點');
      try {
        const response = await api.get('/admin/notifications/recent-changes?limit=5');
        results.push({
          test: '最近修改記錄端點',
          success: response.data.success,
          data: response.data.data,
          status: '✅ 成功'
        });
        console.log('✅ 最近修改記錄端點測試成功:', response.data);
      } catch (err: any) {
        results.push({
          test: '最近修改記錄端點',
          success: false,
          error: err.message,
          status: '❌ 失敗'
        });
        console.error('❌ 最近修改記錄端點測試失敗:', err);
      }

      // 測試 3: 所有修改記錄端點
      console.log('🧪 測試 3: 所有修改記錄端點');
      try {
        const response = await api.get('/admin/notifications/tutor-changes?page=1&limit=10');
        results.push({
          test: '所有修改記錄端點',
          success: response.data.success,
          data: response.data.data,
          status: '✅ 成功'
        });
        console.log('✅ 所有修改記錄端點測試成功:', response.data);
      } catch (err: any) {
        results.push({
          test: '所有修改記錄端點',
          success: false,
          error: err.message,
          status: '❌ 失敗'
        });
        console.error('❌ 所有修改記錄端點測試失敗:', err);
      }

      setTestResults(results);
      console.log('🎉 所有測試完成！');

    } catch (error) {
      setError('測試過程中發生錯誤');
      console.error('❌ 測試失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          通知系統測試
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          這個測試頁面用來驗證通知系統的各個 API 端點是否正常工作。
        </Typography>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={testNotificationAPI}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? '測試中...' : '開始測試'}
        </Button>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={20} />
            <Typography>正在測試 API 端點...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {testResults.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              測試結果
            </Typography>
            
            {testResults.map((result, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {result.test}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={result.success ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {result.status}
                  </Typography>
                </Box>
                
                {result.success ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      數據摘要:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error.main">
                    錯誤: {result.error}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            📋 測試說明
          </Typography>
          <Typography variant="body2" paragraph>
            這個測試會檢查以下三個 API 端點：
          </Typography>
          <ul>
            <li><strong>基本通知端點</strong> - 檢查管理員通知系統是否正常</li>
            <li><strong>最近修改記錄端點</strong> - 檢查導師修改記錄查詢是否正常</li>
            <li><strong>所有修改記錄端點</strong> - 檢查完整修改記錄查詢是否正常</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2 }}>
            如果所有測試都通過，說明後端 API 工作正常。如果前端仍然沒有顯示通知，可能是前端組件的問題。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotificationTest;
