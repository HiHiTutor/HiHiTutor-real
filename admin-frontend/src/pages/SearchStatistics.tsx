import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { statisticsAPI } from '../services/api';

interface SearchStats {
  subjectSearchStats: Array<{
    subject: string;
    searchCount: number;
    uniqueUserCount: number;
    avgResultsCount: number;
  }>;
  searchTypeStats: Array<{
    searchType: string;
    count: number;
    uniqueUserCount: number;
  }>;
  dailySearchTrend: Array<{
    date: string;
    searchCount: number;
    uniqueUserCount: number;
  }>;
  popularKeywords: Array<{
    keyword: string;
    count: number;
    uniqueUserCount: number;
  }>;
  summary: {
    totalSearches: number;
    totalUniqueUsers: number;
    topSubject: string;
    topKeyword: string;
  };
}

interface MatchingStats {
  matchStats: Array<{
    subject: string;
    studentMatchCount: number;
    tutorMatchCount: number;
    totalMatchCount: number;
    avgBudget: number;
    avgPrice: number;
    avgResponseTimeHours: number;
  }>;
  summary: {
    totalMatches: number;
    topMatchingSubject: string;
    avgResponseTime: number;
  };
}

const SearchStatistics: React.FC = () => {
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 日期範圍
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState('day');

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        groupBy
      };

      const [searchResponse, matchingResponse] = await Promise.all([
        statisticsAPI.getSearchStats(params),
        statisticsAPI.getMatchingStats(params)
      ]);

      setSearchStats(searchResponse.data.data);
      setMatchingStats(matchingResponse.data.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('獲取統計數據失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleRefresh = () => {
    fetchStatistics();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          搜尋與配對統計
        </Typography>
        <Button variant="contained" onClick={handleRefresh}>
          刷新數據
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 日期範圍選擇器 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              label="開始日期"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="結束日期"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>分組方式</InputLabel>
              <Select
                value={groupBy}
                label="分組方式"
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <MenuItem value="day">按日</MenuItem>
                <MenuItem value="hour">按小時</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={fetchStatistics}>
              查詢
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* 搜尋統計摘要 */}
        {searchStats && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  搜尋統計摘要
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {searchStats.summary.totalSearches}
                      </Typography>
                      <Typography color="textSecondary">總搜尋次數</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {searchStats.summary.totalUniqueUsers}
                      </Typography>
                      <Typography color="textSecondary">獨立用戶數</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {searchStats.summary.topSubject}
                      </Typography>
                      <Typography color="textSecondary">最熱門科目</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {searchStats.summary.topKeyword}
                      </Typography>
                      <Typography color="textSecondary">最熱門關鍵字</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 科目搜尋頻率 */}
        {searchStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  科目搜尋頻率
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>科目</TableCell>
                        <TableCell align="right">搜尋次數</TableCell>
                        <TableCell align="right">獨立用戶</TableCell>
                        <TableCell align="right">平均結果數</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchStats.subjectSearchStats.slice(0, 10).map((stat) => (
                        <TableRow key={stat.subject}>
                          <TableCell>{stat.subject}</TableCell>
                          <TableCell align="right">{stat.searchCount}</TableCell>
                          <TableCell align="right">{stat.uniqueUserCount}</TableCell>
                          <TableCell align="right">{stat.avgResultsCount.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 成功配對統計 */}
        {matchingStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  成功配對統計
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>科目</TableCell>
                        <TableCell align="right">學生配對</TableCell>
                        <TableCell align="right">導師配對</TableCell>
                        <TableCell align="right">總配對數</TableCell>
                        <TableCell align="right">平均回應時間(小時)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {matchingStats.matchStats.slice(0, 10).map((stat) => (
                        <TableRow key={stat.subject}>
                          <TableCell>{stat.subject}</TableCell>
                          <TableCell align="right">{stat.studentMatchCount}</TableCell>
                          <TableCell align="right">{stat.tutorMatchCount}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={stat.totalMatchCount} 
                              color="success" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="right">{stat.avgResponseTimeHours.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 熱門搜尋關鍵字 */}
        {searchStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  熱門搜尋關鍵字
                </Typography>
                <List>
                  {searchStats.popularKeywords.slice(0, 10).map((keyword, index) => (
                    <React.Fragment key={keyword.keyword}>
                      <ListItem>
                        <ListItemText
                          primary={keyword.keyword}
                          secondary={`${keyword.count} 次搜尋 (${keyword.uniqueUserCount} 個用戶)`}
                        />
                      </ListItem>
                      {index < searchStats.popularKeywords.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 搜尋類型分布 */}
        {searchStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  搜尋類型分布
                </Typography>
                <List>
                  {searchStats.searchTypeStats.map((stat, index) => (
                    <React.Fragment key={stat.searchType}>
                      <ListItem>
                        <ListItemText
                          primary={stat.searchType}
                          secondary={`${stat.count} 次搜尋 (${stat.uniqueUserCount} 個用戶)`}
                        />
                      </ListItem>
                      {index < searchStats.searchTypeStats.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SearchStatistics; 