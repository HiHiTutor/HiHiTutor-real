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
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Badge,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Article {
  _id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  author: string;
  authorId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  views: number;
  featured: boolean;
}

const ArticleApprovals: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const API_BASE = process.env.REACT_APP_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/articles/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('載入文章失敗');
      }

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入文章失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId: string) => {
    try {
      setProcessing(articleId);
      
      const response = await fetch(`${API_BASE}/api/articles/${articleId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('審批失敗');
      }

      // 更新本地狀態
      setArticles(prev => prev.map(article => 
        article._id === articleId 
          ? { ...article, status: 'approved' as const }
          : article
      ));

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '審批失敗');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (articleId: string) => {
    if (!rejectReason.trim()) {
      setError('請輸入拒絕原因');
      return;
    }

    try {
      setProcessing(articleId);
      
      const response = await fetch(`${API_BASE}/api/articles/${articleId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        throw new Error('拒絕失敗');
      }

      // 更新本地狀態
      setArticles(prev => prev.map(article => 
        article._id === articleId 
          ? { ...article, status: 'rejected' as const }
          : article
      ));

      setRejectDialogOpen(false);
      setRejectReason('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '拒絕失敗');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="待審核" color="warning" size="small" />;
      case 'approved':
        return <Chip label="已通過" color="success" size="small" />;
      case 'rejected':
        return <Chip label="已拒絕" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning.main';
      case 'approved':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const pendingCount = articles.filter(a => a.status === 'pending').length;
  const approvedCount = articles.filter(a => a.status === 'approved').length;
  const rejectedCount = articles.filter(a => a.status === 'rejected').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          文章審批管理
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadArticles}
          disabled={loading}
        >
          刷新
        </Button>
      </Box>

      {/* 統計卡片 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                待審核文章
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                已通過文章
              </Typography>
              <Typography variant="h4" color="success.main">
                {approvedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                已拒絕文章
              </Typography>
              <Typography variant="h4" color="error.main">
                {rejectedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>標題</TableCell>
                <TableCell>作者</TableCell>
                <TableCell>標籤</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>投稿時間</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article._id}>
                  <TableCell>
                    <Typography variant="subtitle2" noWrap>
                      {article.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {article.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(article.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(article.createdAt).toLocaleDateString('zh-HK')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedArticle(article);
                          setViewDialogOpen(true);
                        }}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {article.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(article._id)}
                            disabled={processing === article._id}
                            color="success"
                          >
                            <ApproveIcon />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedArticle(article);
                              setRejectDialogOpen(true);
                            }}
                            disabled={processing === article._id}
                            color="error"
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 查看文章詳情對話框 */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedArticle?.title}
          <Chip
            label={selectedArticle?.status === 'pending' ? '待審核' : 
                   selectedArticle?.status === 'approved' ? '已通過' : '已拒絕'}
            color={selectedArticle?.status === 'pending' ? 'warning' : 
                   selectedArticle?.status === 'approved' ? 'success' : 'error'}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" color="textSecondary">
              作者：{selectedArticle?.author}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              投稿時間：{selectedArticle?.createdAt ? new Date(selectedArticle.createdAt).toLocaleString('zh-HK') : ''}
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>摘要</Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedArticle?.summary}
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>標籤</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {selectedArticle?.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>內容</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedArticle?.content}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>關閉</Button>
        </DialogActions>
      </Dialog>

      {/* 拒絕原因對話框 */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>拒絕文章</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            請輸入拒絕原因，這將幫助導師了解需要改進的地方。
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="拒絕原因"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="請詳細說明拒絕的原因..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>取消</Button>
          <Button
            onClick={() => selectedArticle && handleReject(selectedArticle._id)}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || processing === selectedArticle?._id}
          >
            確認拒絕
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticleApprovals;
