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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import api from '../services/api';

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

interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
}

const TutorChangeMonitor: React.FC = () => {
  const [changes, setChanges] = useState<TutorChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedTutor, setSelectedTutor] = useState<TutorChange | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [recentChanges, setRecentChanges] = useState<any[]>([]);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/admin/notifications/tutor-changes?page=${page + 1}&limit=${rowsPerPage}`);
      
      if (response.data.success) {
        setChanges(response.data.data);
        setTotal(response.data.pagination.total);
      } else {
        throw new Error(response.data.message || '獲取數據失敗');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentChanges = async () => {
    try {
      const response = await api.get('/admin/notifications/recent-changes?limit=5');
      if (response.data.success) {
        setRecentChanges(response.data.data);
      }
    } catch (err) {
      console.error('獲取最近修改記錄失敗:', err);
    }
  };

  useEffect(() => {
    fetchChanges();
    fetchRecentChanges();
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
      const response = await api.get('/admin/notifications/export-changes', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
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
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '無';
      }
      return JSON.stringify(value);
    }
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
      'tutorProfile.teachingMode': '教學模式',
      'tutorProfile.teachingSubModes': '教學子模式',
      'tutorProfile.region': '地區',
      'tutorProfile.subRegions': '子地區',
      'tutorProfile.category': '課程分類',
      'tutorProfile.subCategory': '子科目',
      'documents.idCard': '身份證',
      'documents.educationCert': '學歷證書'
    };
    
    return fieldMap[field] || field;
  };

  const openDetailDialog = (tutor: TutorChange) => {
    setSelectedTutor(tutor);
    setDetailDialogOpen(true);
  };

  const handleViewUserDetail = (tutorId: string) => {
    // 在新標籤頁中打開用戶詳情頁面
    window.open(`/users/${tutorId}`, '_blank');
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedTutor(null);
  };

  const getChangeType = (field: string): 'critical' | 'important' | 'normal' => {
    const criticalFields = ['tutorProfile.subjects', 'tutorProfile.sessionRate', 'documents.idCard', 'documents.educationCert'];
    const importantFields = ['tutorProfile.teachingMode', 'tutorProfile.region', 'tutorProfile.category'];
    
    if (criticalFields.includes(field)) return 'critical';
    if (importantFields.includes(field)) return 'important';
    return 'normal';
  };

  if (loading && changes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            導師資料修改監控
          </Typography>
        </Box>
        <Box>
          <Tooltip title="刷新數據">
            <IconButton onClick={fetchChanges} disabled={loading} size="large">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="導出CSV">
            <IconButton onClick={handleExport} disabled={loading} size="large">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 最近修改摘要 */}
      {recentChanges.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              最近修改摘要
            </Typography>
            <Grid container spacing={2}>
              {recentChanges.slice(0, 3).map((change, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                    <Typography variant="subtitle2" color="warning.dark">
                      {change.name} ({change.tutorId})
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      修改了 {change.change.fields.length} 個欄位
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(change.change.timestamp), 'MM-dd HH:mm', { locale: zhTW })}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {changes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            目前沒有導師資料修改記錄
          </Typography>
          <Typography variant="body2" color="textSecondary">
            所有導師資料都是最新的
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
                  <TableCell>用戶詳情</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changes.map((tutor) => (
                  <TableRow key={tutor.tutorId} hover>
                    <TableCell>
                      <Chip label={tutor.tutorId} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {tutor.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{tutor.email}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(tutor.changes[0]?.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhTW })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tutor.changes.length} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="查看用戶詳情">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewUserDetail(tutor.tutorId)}
                          color="secondary"
                        >
                          <PersonIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="查看詳細修改記錄">
                        <IconButton 
                          size="small" 
                          onClick={() => openDetailDialog(tutor)}
                          color="primary"
                        >
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
            rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* 詳細修改記錄彈窗 */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <VisibilityIcon color="primary" />
            導師修改記錄詳情
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTutor && (
            <Box>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedTutor.name} ({selectedTutor.tutorId})
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedTutor.email}
                </Typography>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                修改記錄 ({selectedTutor.changes.length} 次)
              </Typography>
              
              {selectedTutor.changes.map((change, index) => (
                <Accordion key={index} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
                      <Typography variant="subtitle1">
                        {format(new Date(change.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                      </Typography>
                      <Chip 
                        label={`${change.fields.length} 個欄位`} 
                        size="small" 
                        color="primary" 
                      />
                      {change.ipAddress && (
                        <Chip 
                          label={`IP: ${change.ipAddress}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {change.fields.map((field, fieldIndex) => {
                        const changeType = getChangeType(field);
                        const oldValue = change.oldValues[field];
                        const newValue = change.newValues[field];
                        
                        return (
                          <ListItem key={fieldIndex} sx={{ 
                            backgroundColor: changeType === 'critical' ? '#ffebee' : 
                                           changeType === 'important' ? '#fff3e0' : '#f5f5f5',
                            borderRadius: 1,
                            mb: 1
                          }}>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    {getFieldDisplayName(field)}
                                  </Typography>
                                  {changeType === 'critical' && (
                                    <Chip label="重要" size="small" color="error" />
                                  )}
                                  {changeType === 'important' && (
                                    <Chip label="注意" size="small" color="warning" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>舊值:</strong> {formatFieldValue(oldValue)}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>新值:</strong> {formatFieldValue(newValue)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailDialog}>關閉</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorChangeMonitor;
