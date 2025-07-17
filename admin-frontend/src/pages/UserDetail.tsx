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
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
} from '@mui/material';
import { usePermissions } from '../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { usersAPI } from '../services/api';
import { setSelectedUser } from '../store/slices/userSlice';
import { User } from '../types';

interface EditFormData {
  userId?: string;
  tutorId?: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'tutor' | 'organization' | 'admin' | 'super_admin';
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'pending' | 'blocked';
  avatar: string;
  isActive: boolean;
  isVip?: boolean;
  vipLevel?: number;
  isTop?: boolean;
  topLevel?: number;
  isPaid?: boolean;
  paymentType?: 'free' | 'basic' | 'premium' | 'vip';
  promotionLevel?: number;
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
    gender?: 'male' | 'female';
    birthDate?: string;
    teachingExperienceYears?: number;
    educationLevel?: string;
    subjects?: string[];
    examResults?: Array<{
      subject: string;
      grade: string;
    }>;
    teachingAreas?: string[];
    availableTime?: Array<{
      day: string;
      time: string;
    }>;
    teachingMethods?: string[];
    classType?: string[];
    sessionRate?: number;
    introduction?: string;
    courseFeatures?: string;
    avatarUrl?: string;
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
  const { canDeleteUsers } = usePermissions();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [editTabValue, setEditTabValue] = useState(0);
  const [editForm, setEditForm] = useState<EditFormData>({
    userId: '',
    tutorId: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    userType: 'student',
    status: 'active',
    avatar: '',
    isActive: true,
    isVip: false,
    vipLevel: 0,
    isTop: false,
    topLevel: 0,
    isPaid: false,
    paymentType: 'free',
    promotionLevel: 0,
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
        userId: userData.userId || '',
        tutorId: userData.tutorId || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'user',
        userType: userData.userType || 'student',
        status: userData.status || 'active',
        avatar: userData.avatar || '',
        isActive: userData.status === 'active',
        isVip: userData.isVip || false,
        vipLevel: userData.vipLevel || 0,
        isTop: userData.isTop || false,
        topLevel: userData.topLevel || 0,
        isPaid: userData.isPaid || false,
        paymentType: userData.paymentType || 'free',
        promotionLevel: userData.promotionLevel || 0,
        organizationDocuments: userData.organizationDocuments || {
          businessRegistration: '',
          addressProof: ''
        },
            tutorProfile: userData.tutorProfile || {
      education: '',
      experience: '',
      specialties: [],
      documents: [],
      applicationStatus: 'pending',
      gender: undefined,
      birthDate: '',
      teachingExperienceYears: 0,
      educationLevel: '',
      subjects: [],
      examResults: [],
      teachingAreas: [],
      availableTime: [],
      teachingMethods: [],
      classType: [],
      sessionRate: 0,
      introduction: '',
      courseFeatures: '',
      avatarUrl: ''
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
    if (name === 'vipLevel' || name === 'topLevel' || name === 'promotionLevel') {
      setEditForm(prev => ({ ...prev, [name]: Number(value) }));
      return;
    }
    if (name === 'userId' || name === 'tutorId') {
      setEditForm(prev => ({ ...prev, [name]: value }));
      return;
    }
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

  const handleDeleteUser = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await usersAPI.deleteUser(id, deleteReason);
      setSuccess('用戶刪除成功');
      setIsDeleteDialogOpen(false);
      setDeleteReason('');
      
      // 延遲導航，讓用戶看到成功消息
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || '刪除用戶失敗');
    } finally {
      setLoading(false);
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
                  label={selectedUser.userType === 'super_admin' ? '超級管理員' : 
                         selectedUser.userType === 'admin' ? '管理員' : 
                         selectedUser.userType === 'tutor' ? '導師' : 
                         selectedUser.userType === 'student' ? '學生' : 
                         selectedUser.userType === 'organization' ? '機構' : 
                         selectedUser.userType} 
                  color={selectedUser.userType === 'super_admin' ? 'error' : 
                         selectedUser.userType === 'admin' ? 'secondary' : 
                         selectedUser.userType === 'tutor' ? 'primary' : 
                         selectedUser.userType === 'student' ? 'info' : 
                         selectedUser.userType === 'organization' ? 'success' : 'default'} 
                />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">角色</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip 
                  label={selectedUser.role === 'super_admin' ? '超級管理員' : 
                         selectedUser.role === 'admin' ? '管理員' : '用戶'} 
                  color={selectedUser.role === 'super_admin' ? 'error' : 
                         selectedUser.role === 'admin' ? 'secondary' : 'default'} 
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
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setIsEditDialogOpen(true)}
              >
                編輯用戶
              </Button>
              {canDeleteUsers && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  刪除用戶
                </Button>
              )}
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
                {/* 性別 */}
                {selectedUser.tutorProfile.gender && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">性別</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip
                        label={selectedUser.tutorProfile.gender === 'male' ? '男' : '女'}
                        color="primary"
                        size="small"
                      />
                    </Grid>
                  </>
                )}
                
                {/* 導師科目 - 優先顯示 tutorProfile 中的 subjects */}
                {selectedUser.tutorProfile.subjects && selectedUser.tutorProfile.subjects.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">可教授科目</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.tutorProfile.subjects.map((subject, index) => (
                          <Chip key={index} label={subject} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                
                {/* 如果 tutorProfile 中沒有 subjects，則顯示根級別的 subjects */}
                {(!selectedUser.tutorProfile.subjects || selectedUser.tutorProfile.subjects.length === 0) && 
                 selectedUser.subjects && selectedUser.subjects.length > 0 && (
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
                
                {/* 教學經驗年數 */}
                {selectedUser.tutorProfile.teachingExperienceYears !== undefined && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">教學經驗</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedUser.tutorProfile.teachingExperienceYears} 年</Typography>
                    </Grid>
                  </>
                )}
                
                {/* 學歷 */}
                {selectedUser.tutorProfile.educationLevel && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">學歷</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedUser.tutorProfile.educationLevel}</Typography>
                    </Grid>
                  </>
                )}
                
                {/* 堂費 */}
                {selectedUser.tutorProfile.sessionRate && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">堂費</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>HK$ {selectedUser.tutorProfile.sessionRate}</Typography>
                    </Grid>
                  </>
                )}
                
                {/* 申請狀態 */}
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
                
                {/* 評分 */}
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
                
                {/* 時薪 (如果與堂費不同) */}
                {selectedUser.hourlyRate && selectedUser.hourlyRate !== selectedUser.tutorProfile.sessionRate && (
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>編輯用戶</DialogTitle>
        <DialogContent>
          <Tabs 
            value={editTabValue} 
            onChange={(e, newValue) => setEditTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="基本資料" />
            {editForm.userType === 'tutor' && <Tab label="導師資料" />}
            <Tab label="詳細資料" />
          </Tabs>
          
          {/* 基本資料標籤頁 */}
          {editTabValue === 0 && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="用戶編號"
                fullWidth
                value={editForm.userId}
                onChange={handleInputChange}
                name="userId"
              />
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
              {editForm.userType === 'tutor' && (
                <TextField
                  label="導師編號"
                  fullWidth
                  value={editForm.tutorId}
                  onChange={handleInputChange}
                  name="tutorId"
                />
              )}
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
                <MenuItem value="admin">管理員</MenuItem>
                <MenuItem value="super_admin">超級管理員</MenuItem>
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
                <MenuItem value="super_admin">超級管理員</MenuItem>
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
              <TextField
                select
                label="付費類型"
                fullWidth
                value={editForm.paymentType}
                onChange={handleInputChange}
                name="paymentType"
              >
                <MenuItem value="free">免費</MenuItem>
                <MenuItem value="basic">基本</MenuItem>
                <MenuItem value="premium">高級</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
              </TextField>
              <TextField
                label="推廣等級"
                type="number"
                fullWidth
                value={editForm.promotionLevel}
                onChange={handleInputChange}
                name="promotionLevel"
                inputProps={{ min: 0, max: 5 }}
                helperText="推廣等級：0-5"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.isVip || false}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isVip: e.target.checked }))}
                    />
                  }
                  label="VIP用戶"
                />
                {editForm.isVip && (
                  <TextField
                    label="VIP等級"
                    type="number"
                    value={editForm.vipLevel}
                    onChange={handleInputChange}
                    name="vipLevel"
                    inputProps={{ min: 0, max: 2 }}
                    helperText="VIP等級：0-2"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.isTop || false}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isTop: e.target.checked }))}
                    />
                  }
                  label="置頂用戶"
                />
                {editForm.isTop && (
                  <TextField
                    label="置頂等級"
                    type="number"
                    value={editForm.topLevel}
                    onChange={handleInputChange}
                    name="topLevel"
                    inputProps={{ min: 0, max: 2 }}
                    helperText="置頂等級：0-2"
                  />
                )}
              </Box>
            </Box>
          )}
          
          {/* 導師資料標籤頁 */}
          {editTabValue === 1 && editForm.userType === 'tutor' && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="性別"
                fullWidth
                value={editForm.tutorProfile.gender || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    gender: e.target.value as 'male' | 'female' | undefined
                  }
                }))}
              >
                <MenuItem value="">未選擇</MenuItem>
                <MenuItem value="male">男</MenuItem>
                <MenuItem value="female">女</MenuItem>
              </TextField>
              
              <TextField
                label="出生日期"
                type="date"
                fullWidth
                value={editForm.tutorProfile.birthDate || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    birthDate: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="教學經驗年數"
                type="number"
                fullWidth
                value={editForm.tutorProfile.teachingExperienceYears || 0}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    teachingExperienceYears: parseInt(e.target.value) || 0
                  }
                }))}
                inputProps={{ min: 0, max: 50 }}
              />
              
              <TextField
                label="學歷等級"
                fullWidth
                value={editForm.tutorProfile.educationLevel || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    educationLevel: e.target.value
                  }
                }))}
              />
              
              <TextField
                label="堂費 (HK$)"
                type="number"
                fullWidth
                value={editForm.tutorProfile.sessionRate || 0}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    sessionRate: parseInt(e.target.value) || 0
                  }
                }))}
                inputProps={{ min: 100 }}
                helperText="最低堂費：HK$ 100"
              />
              
              <TextField
                select
                label="申請狀態"
                fullWidth
                value={editForm.tutorProfile.applicationStatus}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    applicationStatus: e.target.value as 'pending' | 'approved' | 'rejected'
                  }
                }))}
              >
                <MenuItem value="pending">待審核</MenuItem>
                <MenuItem value="approved">已批准</MenuItem>
                <MenuItem value="rejected">已拒絕</MenuItem>
              </TextField>
              
              <TextField
                label="自我介紹"
                multiline
                rows={4}
                fullWidth
                value={editForm.tutorProfile.introduction || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    introduction: e.target.value
                  }
                }))}
              />
              
              <TextField
                label="課程特色"
                multiline
                rows={3}
                fullWidth
                value={editForm.tutorProfile.courseFeatures || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  tutorProfile: {
                    ...prev.tutorProfile,
                    courseFeatures: e.target.value
                  }
                }))}
              />
            </Box>
          )}
          
          {/* 詳細資料標籤頁 */}
          {editTabValue === 2 && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="自我介紹"
                multiline
                rows={4}
                fullWidth
                value={editForm.introduction || ''}
                onChange={handleInputChange}
                name="introduction"
              />
              
              <TextField
                label="評分"
                type="number"
                fullWidth
                value={editForm.rating || 0}
                onChange={handleInputChange}
                name="rating"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                helperText="評分：0-5"
              />
              
              <TextField
                label="時薪 (HK$)"
                type="number"
                fullWidth
                value={editForm.hourlyRate || 0}
                onChange={handleInputChange}
                name="hourlyRate"
                inputProps={{ min: 0 }}
              />
              
              <TextField
                label="教學經驗"
                type="number"
                fullWidth
                value={editForm.experience || 0}
                onChange={handleInputChange}
                name="experience"
                inputProps={{ min: 0 }}
                helperText="教學經驗年數"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 刪除用戶確認對話框 */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" color="error">
            確認刪除用戶
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            您確定要刪除用戶 <strong>{selectedUser?.name}</strong> ({selectedUser?.email}) 嗎？
          </Typography>
          <Typography color="error" sx={{ mb: 2 }}>
            此操作無法撤銷，用戶的所有數據將被永久刪除。
          </Typography>
          <TextField
            label="刪除原因（可選）"
            multiline
            rows={3}
            fullWidth
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="請說明刪除此用戶的原因..."
            helperText="建議填寫刪除原因以便記錄"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            取消
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? '刪除中...' : '確認刪除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetail; 