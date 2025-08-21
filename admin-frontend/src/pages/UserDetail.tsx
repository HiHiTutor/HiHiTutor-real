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

// 課程分類選項 - 與 CreateUser.tsx 保持一致
const CATEGORY_OPTIONS = {
  'early-childhood': {
    label: '幼兒教育',
    subjects: [
      { value: 'early-childhood-chinese', label: '幼兒中文' },
      { value: 'early-childhood-english', label: '幼兒英文' },
      { value: 'early-childhood-math', label: '幼兒數學' },
      { value: 'early-childhood-phonics', label: '拼音／注音' },
      { value: 'early-childhood-logic', label: '邏輯思維訓練' },
      { value: 'early-childhood-interview', label: '面試技巧訓練' },
      { value: 'early-childhood-homework', label: '幼稚園功課輔導' }
    ]
  },
  'primary-secondary': {
    label: '中小學教育',
    subCategories: [
      {
        value: 'primary',
        label: '小學教育',
        subjects: [
          { value: 'primary-chinese', label: '中文' },
          { value: 'primary-english', label: '英文' },
          { value: 'primary-math', label: '數學' },
          { value: 'primary-general', label: '常識' },
          { value: 'primary-mandarin', label: '普通話' },
          { value: 'primary-stem', label: '常識／STEM' },
          { value: 'primary-all', label: '全科補習' }
        ]
      },
      {
        value: 'secondary',
        label: '中學教育',
        subjects: [
          { value: 'secondary-chinese', label: '中文' },
          { value: 'secondary-english', label: '英文' },
          { value: 'secondary-math', label: '數學' },
          { value: 'secondary-ls', label: '通識教育' },
          { value: 'secondary-physics', label: '物理' },
          { value: 'secondary-chemistry', label: '化學' },
          { value: 'secondary-biology', label: '生物' },
          { value: 'secondary-economics', label: '經濟' },
          { value: 'secondary-geography', label: '地理' },
          { value: 'secondary-history', label: '歷史' },
          { value: 'secondary-chinese-history', label: '中國歷史' },
          { value: 'secondary-bafs', label: 'BAFS' },
          { value: 'secondary-ict', label: 'ICT' },
          { value: 'secondary-integrated-science', label: '綜合科學' },
          { value: 'secondary-dse', label: '其他 DSE 專科補習' },
          { value: 'secondary-all', label: '全科補習' }
        ]
      }
    ]
  },
  'interest': {
    label: '興趣班',
    subjects: [
      { value: 'art', label: '繪畫' },
      { value: 'music', label: '音樂（鋼琴、結他、小提琴等）' },
      { value: 'dance', label: '跳舞／舞蹈訓練' },
      { value: 'drama', label: '戲劇／演講' },
      { value: 'programming', label: '編程／STEM' },
      { value: 'foreign-language', label: '外語（韓文／日文／法文／德文等）' },
      { value: 'magic-chess', label: '魔術／棋藝' },
      { value: 'photography', label: '攝影／影片剪接' }
    ]
  },
  'tertiary': {
    label: '大專補習課程',
    subjects: [
      { value: 'uni-liberal', label: '大學通識' },
      { value: 'uni-math', label: '大學統計與數學' },
      { value: 'uni-economics', label: '經濟學' },
      { value: 'uni-it', label: '資訊科技' },
      { value: 'uni-business', label: '商科（會計、管理、市場學等）' },
      { value: 'uni-engineering', label: '工程科目' },
      { value: 'uni-thesis', label: '論文指導／報告協助' }
    ]
  },
  'adult': {
    label: '成人教育',
    subjects: [
      { value: 'adult-chinese', label: '中文（寫作、閱讀、會話）' },
      { value: 'adult-english', label: '英文（寫作、閱讀、會話）' },
      { value: 'adult-math', label: '數學（基礎、進階）' },
      { value: 'adult-computer', label: '電腦技能' },
      { value: 'adult-business', label: '商業技能' },
      { value: 'adult-language', label: '外語學習' }
    ]
  }
};

// 地區選項配置 - 統一版本
const REGION_OPTIONS = [
  {
    value: 'unlimited',
    label: '不限',
    regions: []
  },
  {
    value: 'all-hong-kong',
    label: '全香港',
    regions: []
  },
  {
    value: 'hong-kong-island',
    label: '香港島',
    regions: [
      { value: 'central', label: '中環' },
      { value: 'sheung-wan', label: '上環' },
      { value: 'sai-wan', label: '西環' },
      { value: 'sai-ying-pun', label: '西營盤' },
      { value: 'shek-tong-tsui', label: '石塘咀' },
      { value: 'wan-chai', label: '灣仔' },
      { value: 'causeway-bay', label: '銅鑼灣' },
      { value: 'admiralty', label: '金鐘' },
      { value: 'happy-valley', label: '跑馬地' },
      { value: 'tin-hau', label: '天后' },
      { value: 'tai-hang', label: '大坑' },
      { value: 'north-point', label: '北角' },
      { value: 'quarry-bay', label: '鰂魚涌' },
      { value: 'taikoo', label: '太古' },
      { value: 'sai-wan-ho', label: '西灣河' },
      { value: 'shau-kei-wan', label: '筲箕灣' },
      { value: 'chai-wan', label: '柴灣' },
      { value: 'heng-fa-chuen', label: '杏花邨' }
    ]
  },
  {
    value: 'kowloon',
    label: '九龍',
    regions: [
      { value: 'tsim-sha-tsui', label: '尖沙咀' },
      { value: 'jordan', label: '佐敦' },
      { value: 'yau-ma-tei', label: '油麻地' },
      { value: 'mong-kok', label: '旺角' },
      { value: 'prince-edward', label: '太子' },
      { value: 'sham-shui-po', label: '深水埗' },
      { value: 'cheung-sha-wan', label: '長沙灣' },
      { value: 'hung-hom', label: '紅磡' },
      { value: 'to-kwa-wan', label: '土瓜灣' },
      { value: 'ho-man-tin', label: '何文田' },
      { value: 'kowloon-tong', label: '九龍塘' },
      { value: 'san-po-kong', label: '新蒲崗' },
      { value: 'diamond-hill', label: '鑽石山' },
      { value: 'lok-fu', label: '樂富' },
      { value: 'tsz-wan-shan', label: '慈雲山' },
      { value: 'ngau-tau-kok', label: '牛頭角' },
      { value: 'lam-tin', label: '藍田' },
      { value: 'kwun-tong', label: '觀塘' },
      { value: 'yau-tong', label: '油塘' }
    ]
  },
  {
    value: 'new-territories',
    label: '新界',
    regions: [
      { value: 'sha-tin', label: '沙田' },
      { value: 'ma-on-shan', label: '馬鞍山' },
      { value: 'tai-wai', label: '大圍' },
      { value: 'fo-tan', label: '火炭' },
      { value: 'tai-po', label: '大埔' },
      { value: 'tai-wo', label: '太和' },
      { value: 'fan-ling', label: '粉嶺' },
      { value: 'sheung-shui', label: '上水' },
      { value: 'tseung-kwan-o', label: '將軍澳' },
      { value: 'hang-hau', label: '坑口' },
      { value: 'po-lam', label: '寶琳' },
      { value: 'lohas-park', label: '康城' },
      { value: 'tuen-mun', label: '屯門' },
      { value: 'siu-hong', label: '兆康' },
      { value: 'yuen-long', label: '元朗' },
      { value: 'long-ping', label: '朗屏' },
      { value: 'tin-shui-wai', label: '天水圍' },
      { value: 'tsuen-wan', label: '荃灣' },
      { value: 'kwai-fong', label: '葵芳' },
      { value: 'kwai-chung', label: '葵涌' },
      { value: 'tsing-yi', label: '青衣' }
    ]
  },
  {
    value: 'islands',
    label: '離島',
    regions: [
      { value: 'tung-chung', label: '東涌' },
      { value: 'mui-wo', label: '梅窩' },
      { value: 'tai-o', label: '大澳' },
      { value: 'ping-chau', label: '坪洲' },
      { value: 'cheung-chau', label: '長洲' },
      { value: 'lamma-island', label: '南丫島' },
      { value: 'discovery-bay', label: '愉景灣' },
      { value: 'pui-o', label: '貝澳' }
    ]
  }
];

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
    subjects: string[];
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
    // 新增課程相關字段
    category?: string;
    subCategory?: string;
    teachingMode?: string;
    teachingSubModes?: string[];
    region?: string;
    subRegions?: string[];
  };
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
      avatarUrl: '',
      // 新增課程相關字段
      category: '',
      subCategory: '',
      teachingMode: '',
      teachingSubModes: [],
      region: '',
      subRegions: []
    },
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

  // 地區選擇相關狀態
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('');

  // 地區處理函數
  const handleAddSubRegion = () => {
    if (selectedRegion && selectedSubRegion) {
      setEditForm(prev => ({
        ...prev,
        tutorProfile: {
          ...prev.tutorProfile,
          subRegions: [...(prev.tutorProfile.subRegions || []), `${selectedRegion}-${selectedSubRegion}`]
        }
      }));
      setSelectedRegion('');
      setSelectedSubRegion('');
    }
  };

  const handleDeleteSubRegion = (subRegionToDelete: string) => {
    setEditForm(prev => ({
      ...prev,
      tutorProfile: {
        ...prev.tutorProfile,
        subRegions: (prev.tutorProfile.subRegions || []).filter(sub => sub !== subRegionToDelete)
      }
    }));
  };

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
      avatarUrl: '',
      // 新增課程相關字段
      category: userData.tutorProfile?.category || '',
      subCategory: userData.tutorProfile?.subCategory || '',
      teachingMode: userData.tutorProfile?.teachingMode || '',
      teachingSubModes: userData.tutorProfile?.teachingSubModes || [],
      region: userData.tutorProfile?.region || '',
      subRegions: userData.tutorProfile?.subRegions || []
    },
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

  // 獲取可用的子分類
  const getSubCategories = () => {
    if (editForm.tutorProfile.category === 'primary-secondary') {
      return CATEGORY_OPTIONS['primary-secondary'].subCategories || [];
    }
    return [];
  };

  // 獲取可用的科目
  const getAvailableSubjects = () => {
    if (!editForm.tutorProfile.category) return [];
    
    const category = CATEGORY_OPTIONS[editForm.tutorProfile.category as keyof typeof CATEGORY_OPTIONS];
    if (!category) return [];

    if (editForm.tutorProfile.category === 'primary-secondary') {
      // 中小學教育：顯示所有子科目的科目，允許跨子科目選擇
      const allSubjects: Array<{ value: string; label: string }> = [];
      const categoryWithSubCategories = category as { subCategories?: Array<{ value: string; label: string; subjects: Array<{ value: string; label: string }> }> };
      if (categoryWithSubCategories.subCategories) {
        categoryWithSubCategories.subCategories.forEach((subCat: { value: string; label: string; subjects: Array<{ value: string; label: string }> }) => {
          if (subCat.subjects) {
            allSubjects.push(...subCat.subjects);
          }
        });
      }
      return allSubjects;
    }
    
    const categoryWithSubjects = category as { subjects: Array<{ value: string; label: string }> };
    return categoryWithSubjects.subjects || [];
  };

  const handleSubmit = async () => {
    if (!id) {
      setError('用戶ID不存在');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 開始更新用戶:', id);
      console.log('📤 發送數據:', editForm);
      
      // 特別檢查科目數據
      if (editForm.tutorProfile && editForm.tutorProfile.subjects) {
        console.log('📚 科目數據檢查:', {
          subjects: editForm.tutorProfile.subjects,
          type: typeof editForm.tutorProfile.subjects,
          isArray: Array.isArray(editForm.tutorProfile.subjects),
          length: editForm.tutorProfile.subjects.length
        });
      }
      
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
      console.error('❌ 錯誤詳情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        config: err.config,
        stack: err.stack
      });
      
      // 提供更詳細的錯誤信息
      let errorMessage = '更新失敗';
      
      // 檢查各種錯誤情況
      if (err.response?.status === 401) {
        errorMessage = '認證失敗，請重新登入';
      } else if (err.response?.status === 403) {
        errorMessage = '權限不足，無法執行此操作';
      } else if (err.response?.status === 404) {
        errorMessage = '用戶不存在';
      } else if (err.response?.status === 500) {
        errorMessage = '後端服務器錯誤';
      } else if (err.response?.data?.details) {
        errorMessage = `驗證失敗: ${err.response.data.details}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code) {
        errorMessage = `錯誤代碼: ${err.code}`;
      }
      
      setError(errorMessage);
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
    } else if (name === 'category') {
      setEditForm(prev => ({
        ...prev,
        tutorProfile: {
          ...prev.tutorProfile,
          category: value as string,
          subCategory: '', // 重置子分類
          subjects: [] // 重置科目
        }
      }));
    } else if (name === 'subCategory') {
      setEditForm(prev => ({
        ...prev,
        tutorProfile: {
          ...prev.tutorProfile,
          subCategory: value as string,
          // 不清空已選科目，讓用戶可以跨子科目選擇
          subjects: prev.tutorProfile.subjects
        }
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

  const handleApproveOrganization = async () => {
    if (!id) return;
    try {
      await usersAPI.approveOrganization(id);
      const response = await usersAPI.getUserById(id);
      if (response.data.success && response.data.user) {
        dispatch(setSelectedUser(response.data.user as User));
      }
    } catch (error) {
      console.error('Error approving organization:', error);
    }
  };

  const handleRejectOrganization = async () => {
    if (!id) return;
    try {
      await usersAPI.rejectOrganization(id);
      const response = await usersAPI.getUserById(id);
      if (response.data.success && response.data.user) {
        dispatch(setSelectedUser(response.data.user as User));
      }
    } catch (error) {
      console.error('Error rejecting organization:', error);
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
              
              {/* VIP等級 */}
              <Grid item xs={4}>
                <Typography color="textSecondary">VIP等級</Typography>
              </Grid>
              <Grid item xs={8}>
                {(selectedUser as any).isVip ? (
                  <Chip
                    label="VIP"
                    color="warning"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="普通"
                    color="default"
                    size="small"
                  />
                )}
              </Grid>
              
              {/* 置頂等級 */}
              <Grid item xs={4}>
                <Typography color="textSecondary">置頂等級</Typography>
              </Grid>
              <Grid item xs={8}>
                {(selectedUser as any).isTop ? (
                  <Chip
                    label="置頂"
                    color="info"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="普通"
                    color="default"
                    size="small"
                  />
                )}
              </Grid>
              
              {/* 評分 */}
              {(selectedUser as any).rating !== undefined && (
                <>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">評分</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{(selectedUser as any).rating.toFixed(1)} / 5.0</Typography>
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
                {/* 出生日期 */}
                {selectedUser.tutorProfile.birthDate && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">出生日期</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{new Date(selectedUser.tutorProfile.birthDate).toLocaleDateString('zh-TW')}</Typography>
                    </Grid>
                  </>
                )}
                {/* 相關科目公開試成績 */}
                {selectedUser.tutorProfile.examResults && selectedUser.tutorProfile.examResults.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">公開試成績</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.tutorProfile.examResults.map((result, idx) => (
                          <Chip key={idx} label={typeof result === 'string' ? result : `${result.subject || ''} ${result.grade || ''}`.trim()} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                {/* 專業資格 */}
                {selectedUser.qualifications && selectedUser.qualifications.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">專業資格</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.qualifications.map((qual, idx) => (
                          <Chip key={idx} label={qual} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                {/* 課程特點 */}
                {selectedUser.tutorProfile.courseFeatures && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">課程特點</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedUser.tutorProfile.courseFeatures}</Typography>
                    </Grid>
                  </>
                )}
                {/* 教學模式 */}
                {selectedUser.tutorProfile.teachingMethods && selectedUser.tutorProfile.teachingMethods.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">教學模式</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.tutorProfile.teachingMethods.map((method, idx) => (
                          <Chip key={idx} label={method} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                {/* 上堂地點 */}
                {selectedUser.tutorProfile.teachingAreas && selectedUser.tutorProfile.teachingAreas.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">上堂地點</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.tutorProfile.teachingAreas.map((area, idx) => (
                          <Chip key={idx} label={area} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                {/* 上堂時間 */}
                {selectedUser.tutorProfile.availableTime && selectedUser.tutorProfile.availableTime.length > 0 && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">上堂時間</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedUser.tutorProfile.availableTime.map((time, idx) => (
                          <Chip key={idx} label={typeof time === 'string' ? time : `${time.day || ''} ${time.time || ''}`.trim()} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
                {/* 個人簡介 */}
                {selectedUser.tutorProfile.introduction && (
                  <>
                    <Grid item xs={4}>
                      <Typography color="textSecondary">個人簡介</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedUser.tutorProfile.introduction}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* 機構用戶資料區塊 */}
        {selectedUser.userType === 'organization' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                機構資料
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {/* 商業登記證 */}
                <Grid item xs={4}>
                  <Typography color="textSecondary">商業登記證</Typography>
                </Grid>
                <Grid item xs={8}>
                  {selectedUser.organizationDocuments?.businessRegistration ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(selectedUser.organizationDocuments!.businessRegistration, '_blank')}
                    >
                      查看商業登記證
                    </Button>
                  ) : (
                    <Typography color="textSecondary">未上傳</Typography>
                  )}
                </Grid>
                
                {/* 地址證明 */}
                <Grid item xs={4}>
                  <Typography color="textSecondary">地址證明</Typography>
                </Grid>
                <Grid item xs={8}>
                  {selectedUser.organizationDocuments?.addressProof ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(selectedUser.organizationDocuments!.addressProof, '_blank')}
                    >
                      查看地址證明
                    </Button>
                  ) : (
                    <Typography color="textSecondary">未上傳</Typography>
                  )}
                </Grid>
                
                {/* 審核狀態 */}
                <Grid item xs={4}>
                  <Typography color="textSecondary">審核狀態</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Chip
                    label={selectedUser.status === 'active' ? '已通過' :
                           selectedUser.status === 'pending' ? '待審核' : '已拒絕'}
                    color={selectedUser.status === 'active' ? 'success' : 
                           selectedUser.status === 'pending' ? 'warning' : 'error'}
                    size="small"
                  />
                </Grid>
                
                {/* 審核按鈕 */}
                {selectedUser.status === 'pending' && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApproveOrganization()}
                      >
                        通過審核
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRejectOrganization()}
                      >
                        拒絕申請
                      </Button>
                    </Box>
                  </Grid>
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
              <TextField
                label="評分"
                type="number"
                fullWidth
                value={editForm.rating}
                onChange={handleInputChange}
                name="rating"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                helperText="評分：0.0-5.0"
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
              


              {/* 可教授科目編輯 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  📚 課程設置
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  請按順序選擇：課程分類 → 子科目(可選) → 可教授科目
                </Typography>
                
                {/* 課程分類 */}
                <TextField
                  select
                  label="課程分類"
                  name="category"
                  value={editForm.tutorProfile.category || ''}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  helperText="選擇您要教授的課程類型"
                >
                  {Object.entries(CATEGORY_OPTIONS).map(([key, category]) => (
                    <MenuItem key={key} value={key}>{category.label}</MenuItem>
                  ))}
                </TextField>

                {/* 子科目 (僅中小學教育顯示，可選) */}
                {editForm.tutorProfile.category === 'primary-secondary' && (
                  <TextField
                    select
                    label="子科目 (可選)"
                    name="subCategory"
                    value={editForm.tutorProfile.subCategory || ''}
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText="選擇特定教育階段，或留空表示可教授所有階段"
                  >
                    {getSubCategories().map((subCategory) => (
                      <MenuItem key={subCategory.value} value={subCategory.value}>
                        {subCategory.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {/* 科目選擇提示 */}
                {editForm.tutorProfile.category && (
                  <Box sx={{ 
                    p: 1.5, 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: 1, 
                    border: '1px solid #bbdefb',
                    mb: 2
                  }}>
                    <Typography variant="body2" color="primary">
                      💡 提示：您現在可以選擇可教授的科目了
                      {editForm.tutorProfile.category === 'primary-secondary' && 
                        (editForm.tutorProfile.subCategory ? 
                          `（${editForm.tutorProfile.subCategory === 'primary' ? '小學' : '中學'}階段）` : 
                          '（可跨階段選擇）'
                        )
                      }
                    </Typography>
                  </Box>
                )}

                {/* 科目 (多選) */}
                {editForm.tutorProfile.category && (
                  <>
                    {editForm.tutorProfile.category === 'primary-secondary' ? (
                      // 中小學教育：分組顯示科目
                      <Box>
                        <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                          可教授科目 (多選)
                        </Typography>
                        
                        {/* 小學教育科目 */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                            🏫 小學教育科目
                          </Typography>
                          <TextField
                            select
                            label="小學科目"
                            SelectProps={{ multiple: true }}
                            value={editForm.tutorProfile.subjects.filter(subject => subject.startsWith('primary-'))}
                            onChange={(e) => {
                              const value = e.target.value;
                              const selectedPrimarySubjects = Array.isArray(value) ? value : [value];
                              const existingSecondarySubjects = editForm.tutorProfile.subjects.filter(subject => subject.startsWith('secondary-'));
                              const allSubjects = [...selectedPrimarySubjects, ...existingSecondarySubjects];
                              setEditForm(prev => ({
                                ...prev,
                                tutorProfile: { ...prev.tutorProfile, subjects: allSubjects }
                              }));
                            }}
                            helperText="可多選小學科目"
                            fullWidth
                          >
                            {CATEGORY_OPTIONS['primary-secondary'].subCategories?.find(sub => sub.value === 'primary')?.subjects?.map((subject) => (
                              <MenuItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        {/* 中學教育科目 */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                            🎓 中學教育科目
                          </Typography>
                          <TextField
                            select
                            label="中學科目"
                            SelectProps={{ multiple: true }}
                            value={editForm.tutorProfile.subjects.filter(subject => subject.startsWith('secondary-'))}
                            onChange={(e) => {
                              const value = e.target.value;
                              const selectedSecondarySubjects = Array.isArray(value) ? value : [value];
                              const existingPrimarySubjects = editForm.tutorProfile.subjects.filter(subject => subject.startsWith('primary-'));
                              const allSubjects = [...existingPrimarySubjects, ...selectedSecondarySubjects];
                              setEditForm(prev => ({
                                ...prev,
                                tutorProfile: { ...prev.tutorProfile, subjects: allSubjects }
                              }));
                            }}
                            helperText="可多選中學科目"
                            fullWidth
                          >
                            {CATEGORY_OPTIONS['primary-secondary'].subCategories?.find(sub => sub.value === 'secondary')?.subjects?.map((subject) => (
                              <MenuItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Box>
                    ) : (
                      // 其他課程分類：正常顯示
                      <TextField
                        select
                        label="可教授科目 (多選)"
                        SelectProps={{ multiple: true }}
                        value={editForm.tutorProfile.subjects || []}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditForm(prev => ({
                            ...prev,
                            tutorProfile: {
                              ...prev.tutorProfile,
                              subjects: Array.isArray(value) ? value : [value]
                            }
                          }));
                        }}
                        fullWidth
                        helperText="可多選，按住 Ctrl/Command 鍵選多個"
                      >
                        {getAvailableSubjects().map((subject) => (
                          <MenuItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </>
                )}

                {/* 已選科目顯示 */}
                {editForm.tutorProfile.subjects && editForm.tutorProfile.subjects.length > 0 && (
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    backgroundColor: '#f8f9fa',
                    borderLeft: '4px solid #1976d2',
                    mt: 2
                  }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      📚 已選科目 ({editForm.tutorProfile.subjects.length}個)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {editForm.tutorProfile.subjects.map((subject, index) => {
                        const subjectInfo = getAvailableSubjects().find(s => s.value === subject);
                        return (
                          <Chip
                            key={index}
                            label={subjectInfo ? subjectInfo.label : subject}
                            color="primary"
                            variant="outlined"
                            size="small"
                            onDelete={() => {
                              const newSubjects = editForm.tutorProfile.subjects.filter((_, i) => i !== index);
                              setEditForm(prev => ({
                                ...prev,
                                tutorProfile: {
                                  ...prev.tutorProfile,
                                  subjects: newSubjects
                                }
                              }));
                            }}
                            deleteIcon={<span style={{ fontSize: '14px' }}>×</span>}
                          />
                        );
                      })}
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      點擊科目標籤上的 × 可移除該科目
                    </Typography>
                  </Box>
                )}
              </Box>
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