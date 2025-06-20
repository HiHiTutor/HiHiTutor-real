import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { usersAPI } from '../services/api';
import { setSelectedUser } from '../store/slices/userSlice';
import { User } from '../types';

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'tutor' | 'organization' | 'admin';
  role: 'user' | 'admin';
  status: 'active' | 'pending' | 'blocked';
  avatar: string;
  isActive: boolean;
  organizationDocuments: {
    businessRegistration: string;
    addressProof: string;
  };
  tutorProfile: {
    education: string;
    experience: string;
    specialties: string[];
    documents: string[];
    applicationStatus: 'pending' | 'approved' | 'rejected';
  };
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  rating: number;
  introduction: string;
  qualifications: string[];
  hourlyRate: number;
  availableTime: string[];
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedUser } = useAppSelector((state) => state.users);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    email: '',
    phone: '',
    userType: 'student',
    role: 'user',
    status: 'active',
    avatar: '',
    isActive: true,
    organizationDocuments: {
      businessRegistration: '',
      addressProof: ''
    },
    tutorProfile: {
      education: '',
      experience: '',
      specialties: [],
      documents: [],
      applicationStatus: 'pending'
    },
    subjects: [],
    teachingAreas: [],
    teachingMethods: [],
    experience: 0,
    rating: 0,
    introduction: '',
    qualifications: [],
    hourlyRate: 0,
    availableTime: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!id) {
      setError('用戶ID不存在');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('🔍 開始獲取用戶資料:', id);
      const response = await usersAPI.getUserById(id);
      
      console.log('✅ 用戶資料回應:', response.data);
      
      // 檢查回應結構 - 可能是直接返回用戶資料或包在 success 結構中
      let userData: any;
      if (response.data.success && response.data.user) {
        // 結構: {success: true, user: {...}}
        userData = response.data.user;
      } else if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        // 結構: 直接返回用戶資料
        userData = response.data;
      } else {
        setError('無法獲取用戶資料');
        console.error('❌ API 回應結構異常:', response.data);
        return;
      }
      
      dispatch(setSelectedUser(userData as User));
      setEditForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'user',
        userType: userData.userType || 'student',
        status: userData.status || 'active',
        avatar: userData.avatar || '',
        isActive: userData.status === 'active',
        organizationDocuments: userData.organizationDocuments || {
          businessRegistration: '',
          addressProof: ''
        },
        tutorProfile: userData.tutorProfile || {
          education: '',
          experience: '',
          specialties: [],
          documents: [],
          applicationStatus: 'pending'
        },
        subjects: userData.subjects || [],
        teachingAreas: userData.teachingAreas || [],
        teachingMethods: userData.teachingMethods || [],
        experience: userData.experience || 0,
        rating: userData.rating || 0,
        introduction: userData.introduction || '',
        qualifications: userData.qualifications || [],
        hourlyRate: userData.hourlyRate || 0,
        availableTime: userData.availableTime || []
      });
      console.log('✅ 用戶資料載入成功');
    } catch (err: any) {
      console.error('❌ 獲取用戶資料失敗:', err);
      
      let errorMessage = '獲取用戶資料時發生錯誤';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) {
      setError('用戶ID不存在');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 開始更新用戶:', id);
      console.log('📤 發送數據:', editForm);
      
      const response = await usersAPI.updateUser(id, editForm as Partial<User>);
      console.log('✅ 更新用戶回應:', response);
      console.log('✅ 回應數據:', response.data);
      console.log('✅ 回應結構檢查:', {
        success: response.data.success,
        hasData: !!response.data.data,
        dataType: typeof response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : 'no data'
      });
      
      // 簡化檢查邏輯
      if (response.data && response.data.success) {
        const userData = response.data.data || response.data.user;
        if (userData) {
          dispatch(setSelectedUser(userData as User));
          setIsEditDialogOpen(false);
          setError(null);
          setSuccess('用戶更新成功');
          console.log('✅ 用戶更新成功');
        } else {
          console.error('❌ 回應中沒有用戶數據:', response.data);
          setError('更新失敗 - 回應中沒有用戶數據');
        }
      } else {
        console.error('❌ 回應結構不符合預期:', response.data);
        setError(response.data?.message || '更新失敗 - 回應結構異常');
      }
    } catch (err: any) {
      console.error('❌ 更新用戶失敗:', err);
      setError(err.message || '更新失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setEditForm(prev => ({
        ...prev,
        [name]: value as 'user' | 'admin'
      }));
    } else if (name === 'userType') {
      setEditForm(prev => ({
        ...prev,
        [name]: value as 'student' | 'tutor' | 'organization' | 'admin'
      }));
    } else if (name === 'status') {
      setEditForm(prev => ({
        ...prev,
        [name]: value as 'active' | 'pending' | 'blocked'
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleApproveUpgrade = async (type: string) => {
    if (!id) return;
    try {
      await usersAPI.approveUserUpgrade(id, type);
      const response = await usersAPI.getUserById(id);
      if (response.data.success && response.data.user) {
        dispatch(setSelectedUser(response.data.user as User));
      }
    } catch (error) {
      console.error('Error approving upgrade:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>載入用戶資料中...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchUserData}>
          重新載入
        </Button>
        <Button variant="outlined" onClick={() => navigate('/users')} sx={{ ml: 2 }}>
          返回用戶列表
        </Button>
      </Box>
    );
  }

  // No user data
  if (!selectedUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          找不到用戶資料
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          返回用戶列表
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 成功提示 */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">用戶詳情</Typography>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          返回用戶列表
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              基本資料
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color="textSecondary">用戶編號</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{(selectedUser as any).userId || selectedUser.id || selectedUser._id}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">姓名</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.name}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Email</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">電話</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.phone}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">用戶類型</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip 
                  label={selectedUser.userType === 'tutor' ? '導師' : 
                         selectedUser.userType === 'student' ? '學生' : 
                         selectedUser.userType === 'organization' ? '機構' : 
                         selectedUser.userType} 
                  color="primary" 
                />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">角色</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip 
                  label={selectedUser.role === 'admin' ? '管理員' : '用戶'} 
                  color="secondary" 
                />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">狀態</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={selectedUser.status === 'active' ? '啟用' : 
                         selectedUser.status === 'pending' ? '待審核' : '已封鎖'}
                  color={selectedUser.status === 'active' ? 'success' : 
                         selectedUser.status === 'pending' ? 'warning' : 'error'}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">註冊時間</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{new Date(selectedUser.createdAt).toLocaleString('zh-TW')}</Typography>
              </Grid>
              {(selectedUser as any).tutorId && (
                <>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">導師編號</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{(selectedUser as any).tutorId}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setIsEditDialogOpen(true)}
              >
                編輯用戶
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 導師資料區塊 */}
        {selectedUser.userType === 'tutor' && selectedUser.tutorProfile && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                導師資料
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography color="textSecondary">學歷</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedUser.tutorProfile.education || '未填寫'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="textSecondary">教學經驗</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedUser.tutorProfile.experience || '未填寫'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="textSecondary">申請狀態</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Chip
                    label={selectedUser.tutorProfile.applicationStatus === 'approved' ? '已批准' :
                           selectedUser.tutorProfile.applicationStatus === 'rejected' ? '已拒絕' :
                           selectedUser.tutorProfile.applicationStatus === 'pending' ? '待審核' : '未申請'}
                    color={selectedUser.tutorProfile.applicationStatus === 'approved' ? 'success' :
                           selectedUser.tutorProfile.applicationStatus === 'rejected' ? 'error' :
                           selectedUser.tutorProfile.applicationStatus === 'pending' ? 'warning' : 'default'}
                    size="small"
                  />
                </Grid>
                {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">可教授科目</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.subjects.map((subject, index) => (
                          <Chip key={index} label={subject} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                {selectedUser.rating !== undefined && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">評分</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedUser.rating.toFixed(1)} / 5.0</Typography>
                    </Grid>
                  </>
                )}
                {selectedUser.hourlyRate && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">時薪</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>HK$ {selectedUser.hourlyRate}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* 升級申請區塊 */}
        {selectedUser.upgradeStatus === 'pending' && selectedUser.requestedRole && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                升級申請
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  申請角色
                </Typography>
                <Typography>{selectedUser.requestedRole}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    if (selectedUser.requestedRole) {
                      handleApproveUpgrade(selectedUser.requestedRole);
                    }
                  }}
                >
                  批准
                </Button>
                <Button variant="contained" color="error">
                  拒絕
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* 詳細資料區塊 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              詳細資料
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {selectedUser.introduction && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      自我介紹
                    </Typography>
                    <Typography>{selectedUser.introduction}</Typography>
                  </Grid>
                </>
              )}
              {selectedUser.teachingAreas && selectedUser.teachingAreas.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      教學地區
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedUser.teachingAreas.map((area, index) => (
                        <Chip key={index} label={area} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </>
              )}
              {selectedUser.teachingMethods && selectedUser.teachingMethods.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      教學方式
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedUser.teachingMethods.map((method, index) => (
                        <Chip key={index} label={method} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </>
              )}
              {selectedUser.qualifications && selectedUser.qualifications.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      資格認證
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedUser.qualifications.map((qual, index) => (
                        <Chip key={index} label={qual} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </>
              )}
              {selectedUser.availableTime && selectedUser.availableTime.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      可上課時間
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedUser.availableTime.map((time, index) => (
                        <Chip key={index} label={time} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </>
              )}
              {(selectedUser as any).isVip && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      VIP 等級
                    </Typography>
                    <Chip 
                      label={`VIP Level ${(selectedUser as any).vipLevel || 1}`} 
                      color="warning" 
                      size="small" 
                    />
                  </Grid>
                </>
              )}
              {(selectedUser as any).isTop && (
                <>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      置頂等級
                    </Typography>
                    <Chip 
                      label={`Top Level ${(selectedUser as any).topLevel || 1}`} 
                      color="info" 
                      size="small" 
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>編輯用戶</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="姓名"
              fullWidth
              value={editForm.name}
              onChange={handleInputChange}
              name="name"
            />
            <TextField
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={handleInputChange}
              name="email"
            />
            <TextField
              label="電話"
              fullWidth
              value={editForm.phone}
              onChange={handleInputChange}
              name="phone"
            />
            <TextField
              select
              label="用戶類型"
              fullWidth
              value={editForm.userType}
              onChange={handleInputChange}
              name="userType"
            >
              <MenuItem value="student">學生</MenuItem>
              <MenuItem value="tutor">導師</MenuItem>
              <MenuItem value="organization">機構</MenuItem>
            </TextField>
            <TextField
              select
              label="角色"
              fullWidth
              value={editForm.role}
              onChange={handleInputChange}
              name="role"
            >
              <MenuItem value="user">用戶</MenuItem>
              <MenuItem value="admin">管理員</MenuItem>
            </TextField>
            <TextField
              select
              label="狀態"
              fullWidth
              value={editForm.status}
              onChange={handleInputChange}
              name="status"
            >
              <MenuItem value="active">啟用</MenuItem>
              <MenuItem value="pending">待審核</MenuItem>
              <MenuItem value="blocked">已封鎖</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetail; 