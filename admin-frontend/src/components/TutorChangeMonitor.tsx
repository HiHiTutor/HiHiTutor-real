import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface TutorChange {
  tutorId: string;
  name: string;
  email: string;
  changes: Array<{
    timestamp: string;
    fields: string[];
    oldValues: any;
    newValues: any;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

interface TutorChangeMonitorProps {
  className?: string;
}

const TutorChangeMonitor: React.FC<TutorChangeMonitorProps> = ({ className }) => {
  const [changes, setChanges] = useState<TutorChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/notifications/tutor-changes?page=${page + 1}&limit=${rowsPerPage}`);
      
      if (!response.ok) {
        throw new Error('獲取修改記錄失敗');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setChanges(data.data);
        setTotal(data.pagination.total);
      } else {
        throw new Error(data.message || '獲取數據失敗');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/notifications/export-changes');
      
      if (!response.ok) {
        throw new Error('導出失敗');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tutor-changes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('導出失敗:', err);
      alert('導出失敗，請稍後再試');
    }
  };

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return '無';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getFieldDisplayName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      'name': '姓名',
      'avatar': '頭像',
      'tutorProfile.gender': '性別',
      'tutorProfile.birthDate': '出生日期',
      'tutorProfile.teachingExperienceYears': '教學經驗',
      'tutorProfile.educationLevel': '教育程度',
      'tutorProfile.subjects': '教學科目',
      'tutorProfile.teachingAreas': '教學地區',
      'tutorProfile.teachingMethods': '教學方法',
      'tutorProfile.introduction': '自我介紹',
      'tutorProfile.courseFeatures': '課程特色',
      'tutorProfile.sessionRate': '課時費',
      'tutorProfile.availableTime': '可上課時間',
      'documents.idCard': '身份證',
      'documents.educationCert': '學歷證書'
    };
    
    return fieldMap[field] || field;
  };

  if (loading && changes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          導師資料修改監控
        </Typography>
        <Box>
          <Tooltip title="刷新數據">
            <IconButton onClick={fetchChanges} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="導出CSV">
            <IconButton onClick={handleExport} disabled={loading}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {changes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            目前沒有導師資料修改記錄
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>導師ID</TableCell>
                  <TableCell>姓名</TableCell>
                  <TableCell>電子郵件</TableCell>
                  <TableCell>最近修改</TableCell>
                  <TableCell>修改次數</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changes.map((tutor) => (
                  <TableRow key={tutor.tutorId}>
                    <TableCell>
                      <Chip label={tutor.tutorId} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{tutor.name}</TableCell>
                    <TableCell>{tutor.email}</TableCell>
                    <TableCell>
                      {format(new Date(tutor.changes[0]?.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhTW })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tutor.changes.length} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="查看詳細修改記錄">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="每頁行數:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </>
      )}

      {/* 詳細修改記錄彈窗可以後續添加 */}
    </Box>
  );
};

export default TutorChangeMonitor; 