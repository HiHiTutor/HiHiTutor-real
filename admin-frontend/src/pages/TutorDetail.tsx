import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Container,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usersAPI } from '../services/api';
import { User } from '../types';

interface TutorProfile {
  education: string;
  experience: string;
  specialties: string[];
  documents: string[];
  applicationStatus: 'pending' | 'approved' | 'rejected';
}

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  avatar: string;
  tutorProfile: TutorProfile;
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  rating: number;
  introduction: string;
  qualifications: string[];
  hourlyRate: number;
  availableTime: string[];
  ratingScore: number;
  ratingCount: number;
  isVip: boolean;
  vipLevel: number;
  isTop: boolean;
  topLevel: number;
  isPaid: boolean;
  paymentType: 'free' | 'basic' | 'premium' | 'vip';
  promotionLevel: number;
}

const AVAILABLE_TIMES = [
  '星期一 上午', '星期一 下午', '星期一 晚上',
  '星期二 上午', '星期二 下午', '星期二 晚上',
  '星期三 上午', '星期三 下午', '星期三 晚上',
  '星期四 上午', '星期四 下午', '星期四 晚上',
  '星期五 上午', '星期五 下午', '星期五 晚上',
  '星期六 上午', '星期六 下午', '星期六 晚上',
  '星期日 上午', '星期日 下午', '星期日 晚上'
];

const TutorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newTeachingArea, setNewTeachingArea] = useState('');
  const [newTeachingMethod, setNewTeachingMethod] = useState('');

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!id) {
        setError('無效的導師ID');
        setLoading(false);
        return;
      }

      try {
        const response = await usersAPI.getUserById(id);
        if (response.data.success && response.data.user) {
          setTutor(response.data.user);
        } else {
          setError('無法獲取導師資料');
        }
      } catch (err) {
        setError('獲取導師資料時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    if (!tutor) return;

    const { name, value } = e.target;
    setTutor({
      ...tutor,
      [name]: value,
    });
  };

  const getTypeLabel = (type: 'subjects' | 'teachingAreas' | 'teachingMethods' | 'qualifications' | 'availableTime'): string => {
    switch (type) {
      case 'subjects':
        return '科目';
      case 'teachingAreas':
        return '教學領域';
      case 'teachingMethods':
        return '教學方法';
      case 'qualifications':
        return '資格';
      case 'availableTime':
        return '可用時間';
      default:
        return '';
    }
  };

  const handleAddItem = (type: 'subjects' | 'teachingAreas' | 'teachingMethods' | 'qualifications' | 'availableTime') => {
    const newItem = prompt(`請輸入新的${getTypeLabel(type)}`);
    if (newItem) {
      setTutor(prev => {
        if (!prev) return prev;
        const currentArray = prev[type] || [];
        if (!currentArray.includes(newItem)) {
          return {
            ...prev,
            [type]: [...currentArray, newItem]
          };
        }
        return prev;
      });
    }
  };

  const handleRemoveItem = (type: 'subjects' | 'teachingAreas' | 'teachingMethods' | 'qualifications' | 'availableTime', index: number) => {
    setTutor(prev => {
      if (!prev) return prev;
      const currentArray = prev[type] || [];
      return {
        ...prev,
        [type]: currentArray.filter((_, i) => i !== index)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor) return;

    try {
      setSaving(true);
      const response = await usersAPI.updateUser(tutor._id, {
        ...tutor,
        ratingScore: Number(tutor.ratingScore || 0),
        ratingCount: Number(tutor.ratingCount || 0),
        vipLevel: Number(tutor.vipLevel || 0),
        topLevel: Number(tutor.topLevel || 0),
        promotionLevel: Number(tutor.promotionLevel || 0),
      });

      if (response.data.success) {
        navigate('/users', { state: { refresh: true } });
      } else {
        setError(response.data.message || '更新失敗');
      }
    } catch (err) {
      setError('更新失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>載入中...</Typography>;
  }

  if (!tutor) {
    return <Typography>找不到導師資料</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          導師詳細資料
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 基本資料部分 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="姓名"
                name="name"
                value={tutor.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電郵"
                name="email"
                value={tutor.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電話"
                name="phone"
                value={tutor.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>狀態</InputLabel>
                <Select
                  name="status"
                  value={tutor.status}
                  onChange={handleChange}
                  label="狀態"
                >
                  <MenuItem value="active">活躍</MenuItem>
                  <MenuItem value="inactive">非活躍</MenuItem>
                  <MenuItem value="pending">待審核</MenuItem>
                  <MenuItem value="banned">已封禁</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 評分管理部分 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                評分管理
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="評分分數"
                type="number"
                name="ratingScore"
                value={tutor.ratingScore || 0}
                onChange={handleChange}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                helperText="評分範圍：0-5"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="評價數量"
                type="number"
                name="ratingCount"
                value={tutor.ratingCount || 0}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                helperText="評價總數"
              />
            </Grid>

            {/* 付費等級管理部分 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                付費等級管理
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>付費類型</InputLabel>
                <Select
                  name="paymentType"
                  value={tutor.paymentType || 'free'}
                  onChange={handleChange}
                  label="付費類型"
                >
                  <MenuItem value="free">免費</MenuItem>
                  <MenuItem value="basic">基本</MenuItem>
                  <MenuItem value="premium">高級</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tutor.isPaid || false}
                    onChange={(e) => setTutor({ ...tutor, isPaid: e.target.checked })}
                  />
                }
                label="已付費"
              />
            </Grid>

            {/* VIP和置頂管理部分 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                VIP和置頂管理
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tutor.isVip || false}
                    onChange={(e) => setTutor({ ...tutor, isVip: e.target.checked })}
                  />
                }
                label="VIP用戶"
              />
              {tutor.isVip && (
                <TextField
                  fullWidth
                  label="VIP等級"
                  type="number"
                  name="vipLevel"
                  value={tutor.vipLevel || 0}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 2 }}
                  helperText="VIP等級：0-2"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tutor.isTop || false}
                    onChange={(e) => setTutor({ ...tutor, isTop: e.target.checked })}
                  />
                }
                label="置頂用戶"
              />
              {tutor.isTop && (
                <TextField
                  fullWidth
                  label="置頂等級"
                  type="number"
                  name="topLevel"
                  value={tutor.topLevel || 0}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 2 }}
                  helperText="置頂等級：0-2"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            {/* 推廣等級管理部分 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                推廣等級管理
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="推廣等級"
                type="number"
                name="promotionLevel"
                value={tutor.promotionLevel || 0}
                onChange={handleChange}
                inputProps={{ min: 0, max: 5 }}
                helperText="推廣等級：0-5"
              />
            </Grid>

            {/* 提交按鈕 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TutorDetail; 