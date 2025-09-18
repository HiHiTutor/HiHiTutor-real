import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../hooks/redux';
import { setError } from '../store/slices/caseSlice';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
}

interface FileItem {
  filename: string;
  url: string;
  size: number;
  uploadDate: string;
  type: string;
}

interface FileManagementData {
  userId: string;
  userName: string;
  files: FileItem[];
}

const FileManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fileData, setFileData] = useState<FileManagementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      dispatch(setError(error.message || '獲取用戶列表失敗'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFiles = async (userId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/file-management/users/${userId}/files`);
      if (response.data.success) {
        setFileData(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching user files:', error);
      dispatch(setError(error.message || '獲取用戶文件失敗'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchUserFiles(user._id);
  };

  const handleFileUpload = async () => {
    if (!selectedUser || !selectedFiles || selectedFiles.length === 0) {
      setAlert({ type: 'error', message: '請選擇用戶和文件' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(
        `/admin/file-management/users/${selectedUser._id}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setAlert({ type: 'success', message: '文件上傳成功' });
        setUploadDialogOpen(false);
        setSelectedFiles(null);
        setDescription('');
        fetchUserFiles(selectedUser._id);
      }
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setAlert({ type: 'error', message: error.message || '上傳文件失敗' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (filename: string) => {
    if (!selectedUser) return;

    if (!window.confirm('確定要刪除這個文件嗎？')) return;

    try {
      const response = await api.delete(
        `/admin/file-management/users/${selectedUser._id}/files/${filename}`
      );

      if (response.data.success) {
        setAlert({ type: 'success', message: '文件刪除成功' });
        fetchUserFiles(selectedUser._id);
      }
    } catch (error: any) {
      console.error('Error deleting file:', error);
      setAlert({ type: 'error', message: error.message || '刪除文件失敗' });
    }
  };

  const handleFileDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type === '.pdf') return <PdfIcon />;
    if (['.doc', '.docx'].includes(type)) return <DocIcon />;
    return <FileIcon />;
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        文件管理
      </Typography>

      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 用戶列表 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              用戶列表
            </Typography>
            
            <TextField
              fullWidth
              label="搜尋用戶"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />

            <List>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  selected={selectedUser?._id === user._id}
                  onClick={() => handleUserSelect(user)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">{user.email}</Typography>
                        <Chip 
                          label={user.userType} 
                          size="small" 
                          color="secondary"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 文件管理區域 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {selectedUser ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedUser.name} 的文件
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    上傳文件
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : fileData && fileData.files.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>文件名</TableCell>
                          <TableCell>類型</TableCell>
                          <TableCell>大小</TableCell>
                          <TableCell>上傳時間</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fileData.files.map((file, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFileIcon(file.type)}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {file.filename}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={file.type} size="small" />
                            </TableCell>
                            <TableCell>{formatFileSize(file.size)}</TableCell>
                            <TableCell>
                              {new Date(file.uploadDate).toLocaleString('zh-TW')}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleFileDownload(file)}
                                title="下載"
                              >
                                <DownloadIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleFileDelete(file.filename)}
                                title="刪除"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      該用戶暫無文件
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  請選擇一個用戶來管理文件
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 上傳文件對話框 */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>上傳文件</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            為 {selectedUser?.name} 上傳文件
          </Typography>
          
          <input
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
            style={{ marginBottom: '16px' }}
          />
          
          <TextField
            fullWidth
            label="文件描述（可選）"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            取消
          </Button>
          <Button 
            onClick={handleFileUpload} 
            variant="contained"
            disabled={uploading || !selectedFiles}
          >
            {uploading ? <CircularProgress size={20} /> : '上傳'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManagement;
