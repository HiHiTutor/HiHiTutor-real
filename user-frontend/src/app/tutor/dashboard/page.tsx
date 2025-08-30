'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { tutorApi } from '@/services/api';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import TEACHING_MODE_OPTIONS from '@/constants/teachingModeOptions';
import { useUser } from '@/hooks/useUser';
import ContactInfoWarning from '@/components/ContactInfoWarning';
import { validateFormSubmission } from '@/utils/validation';
import ValidatedInput from '@/components/ValidatedInput';

interface Option {
  value: string;
  label: string;
}

// 時間段選項
const TIME_SLOTS = [
  { value: '08:00-12:00', label: '08:00 - 12:00' },
  { value: '12:00-18:00', label: '12:00 - 18:00' },
  { value: '18:00-21:00', label: '18:00 - 21:00' }
];

// 星期選項
const WEEKDAYS = [
  { value: 'monday', label: '星期一' },
  { value: 'tuesday', label: '星期二' },
  { value: 'wednesday', label: '星期三' },
  { value: 'thursday', label: '星期四' },
  { value: 'friday', label: '星期五' },
  { value: 'saturday', label: '星期六' },
  { value: 'sunday', label: '星期日' }
];

interface TutorProfile {
  tutorId: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: Date | undefined;
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  introduction: string;
  education: string;
  qualifications: string[];
  hourlyRate: number;
  availableTime: string[];
  avatar: string;
  examResults: string;
  courseFeatures: string;
  documents: {
    idCard: string;
    educationCert: string | string[];
  };
  publicCertificates?: string[];
  profileStatus?: 'pending' | 'approved' | 'rejected';
  remarks?: string;
}

// 生成年份選項（18-65歲）
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 18; year >= currentYear - 65; year--) {
    years.push(year);
  }
  return years;
};

// 生成月份選項
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// 生成日期選項
const generateDayOptions = (year: number, month: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

// 準備地區選項數據
const prepareRegionOptions = (): Option[] => {
  return [
    { value: 'all-hong-kong', label: '全港' },
    ...REGION_OPTIONS.filter(region => region.value !== 'unlimited').map(region => ({
      value: region.value,
      label: region.label
    }))
  ];
};

// 準備子地區選項數據
const prepareSubRegionOptions = (regionValue: string): Option[] => {
  if (regionValue === 'all-hong-kong') return [];
  const region = REGION_OPTIONS.find(r => r.value === regionValue);
  return region ? region.regions.map(area => ({
    value: area.value,
    label: area.label
  })) : [];
};

export default function TutorDashboardPage() {
  const router = useRouter();
  const [lastNotificationStatus, setLastNotificationStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState<TutorProfile>({
    tutorId: '',
    name: '',
    gender: 'male',
    birthDate: undefined,
    subjects: [],
    teachingAreas: [],
    teachingMethods: [],
    experience: 0,
    introduction: '',
    education: '',
    qualifications: [],
    hourlyRate: 0,
    availableTime: [],
    avatar: '',
    examResults: '',
    courseFeatures: '',
    documents: {
      idCard: '',
      educationCert: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [birthYear, setBirthYear] = useState<number | undefined>(undefined);
  const [birthMonth, setBirthMonth] = useState<number | undefined>(undefined);
  const [birthDay, setBirthDay] = useState<number | undefined>(undefined);

  // 添加部分保存的狀態
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // 新增狀態管理
  const [showSubjectEditor, setShowSubjectEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [newSubjects, setNewSubjects] = useState<string[]>([]);
  const [selectedTeachingMode, setSelectedTeachingMode] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSubRegionsByRegion, setSelectedSubRegionsByRegion] = useState<{[key: string]: string[]}>({});
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [newAvailableTimes, setNewAvailableTimes] = useState<string[]>([]);
  const [showIdCard, setShowIdCard] = useState(false);
  const [publicCertificates, setPublicCertificates] = useState<string[]>([]);

  const { user } = useUser();

  useEffect(() => {
    fetchTutorProfile();
  }, []);

    // 移除定期檢查審批狀態的功能 - 用戶要求移除自動檢查

  useEffect(() => {
    if (formData.birthDate) {
      const date = new Date(formData.birthDate);
      setBirthYear(date.getFullYear());
      setBirthMonth(date.getMonth() + 1);
      setBirthDay(date.getDate());
    }
  }, [formData.birthDate]);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      const response = await tutorApi.getProfile();
      console.log('🔍 Raw API response:', response);
      
      // 處理API回應格式
      let data;
      if (response.success && response.data) {
        // 如果API返回 {success: true, data: {...}} 格式
        data = response.data;
        console.log('✅ Using response.data:', data);
      } else if (response._id || response.userId || response.tutorId) {
        // 如果API直接返回用戶數據
        data = response;
        console.log('✅ Using direct response:', data);
      } else {
        console.error('❌ Unexpected API response format:', response);
        throw new Error('API回應格式異常');
      }
      
      console.log('🔍 Processed tutor profile data:', data);
      console.log('🔍 Education field:', data.tutorProfile?.educationLevel || data.education);
      console.log('🔍 Profile status:', data.profileStatus);
      
             // 確保科目數據正確設置
       const subjects = data.tutorProfile?.subjects || data.subjects || [];
       const availableTime = data.tutorProfile?.availableTime || data.availableTime || [];
       const qualifications = data.tutorProfile?.qualifications || data.qualifications || [];
       
       // 處理地區數據 - 統一使用 tutorProfile.subRegions 作為權威數據源
       let teachingAreas: string[] = [];
       
       // 檢查數據一致性
       console.log('🔍 檢查地區數據一致性:');
       console.log('  - 根級別 teachingAreas:', data.teachingAreas);
       console.log('  - tutorProfile.teachingAreas:', data.tutorProfile?.teachingAreas);
       console.log('  - tutorProfile.subRegions:', data.tutorProfile?.subRegions);
       
       if (data.tutorProfile?.subRegions && data.tutorProfile.subRegions.length > 0) {
         // 優先使用 tutorProfile.subRegions（完整路徑格式）
         teachingAreas = data.tutorProfile.subRegions;
         console.log('✅ 使用 tutorProfile.subRegions (權威數據源):', teachingAreas);
         
         // 檢查是否有數據不一致的情況
         if (data.teachingAreas && data.teachingAreas.length > 0) {
           console.log('⚠️ 發現數據不一致:');
           console.log('  - 根級別 teachingAreas 數量:', data.teachingAreas.length);
           console.log('  - tutorProfile.subRegions 數量:', data.tutorProfile.subRegions.length);
           
           if (data.teachingAreas.length !== data.tutorProfile.subRegions.length) {
             console.warn('⚠️ 地區數量不匹配，建議同步數據');
           }
         }
       } else if (data.tutorProfile?.teachingAreas && data.tutorProfile.teachingAreas.length > 0) {
         // 如果沒有 subRegions 但有 teachingAreas，使用它們
         teachingAreas = data.tutorProfile.teachingAreas;
         console.log('🔍 使用 tutorProfile.teachingAreas:', teachingAreas);
       } else if (data.teachingAreas && data.teachingAreas.length > 0) {
         // 最後才使用根級別的 teachingAreas
         teachingAreas = data.teachingAreas;
         console.log('🔍 使用根級別 teachingAreas:', teachingAreas);
       }
       
       const publicCertificates = data.tutorProfile?.publicCertificates || data.publicCertificates || [];
       
               // 同步地區數據，確保數據一致性
        if (data.tutorProfile?.subRegions && data.tutorProfile.subRegions.length > 0) {
          // 如果 tutorProfile.subRegions 存在，同步到根級別的 teachingAreas
          // 這樣可以確保兩個數據源保持一致
          console.log('🔄 同步地區數據到根級別 teachingAreas');
          data.teachingAreas = data.tutorProfile.subRegions;
          
          // 強制使用 subRegions 作為權威數據源
          teachingAreas = data.tutorProfile.subRegions;
          console.log('✅ 強制使用 subRegions 作為權威數據源:', teachingAreas);
        }
      
      // 構建新的formData，優先使用tutorProfile中的數據
      const newFormData = {
        tutorId: data.tutorId || data.userId || '',
        name: data.name || '',
        gender: data.gender || 'male',
        birthDate: data.birthDate,
        subjects: subjects,
        teachingAreas: teachingAreas,
        teachingMethods: data.teachingMethods || [],
        experience: data.experience || 0,
        introduction: data.introduction || '',
        education: data.education || '',  // 直接使用 data.education
        qualifications: qualifications,
        hourlyRate: data.hourlyRate || 0,
        availableTime: availableTime,
        avatar: data.avatar || '',
        examResults: data.examResults || '',
        courseFeatures: data.courseFeatures || '',
        documents: {
          idCard: data.documents?.idCard || '',
          educationCert: data.certificateLogs?.map((log: any) => log.fileUrl) || data.documents?.educationCert || []
        },
        publicCertificates: publicCertificates,
        profileStatus: data.profileStatus || 'approved',
        remarks: data.remarks || ''
      };
      
      console.log('🔍 New form data:', newFormData);
      
      setFormData(newFormData);
      setNewSubjects(subjects);
      setNewAvailableTimes(availableTime);
      setPublicCertificates(publicCertificates);
      
        // 設置地區選擇狀態
  if (teachingAreas.length > 0) {
    console.log('🔍 處理已選地區:', teachingAreas);
    
    // 根據已選地區設置狀態
    const subRegionsByRegion: {[key: string]: string[]} = {};
    
    teachingAreas.forEach((area: string) => {
      console.log(`🔍 處理地區: ${area}`);
      
      // 嘗試通過 value 匹配
      let found = false;
      for (const region of REGION_OPTIONS) {
        const subRegion = region.regions?.find((sr: { value: string; label: string }) => sr.value === area);
        if (subRegion) {
          if (!subRegionsByRegion[region.value]) {
            subRegionsByRegion[region.value] = [];
          }
          subRegionsByRegion[region.value].push(area);
          found = true;
          console.log(`✅ 通過 value 匹配: ${area} -> ${region.label}`);
          break;
        }
      }
      
      // 如果通過 value 沒有找到，嘗試通過 label 匹配
      if (!found) {
        for (const region of REGION_OPTIONS) {
          const subRegion = region.regions?.find((sr: { value: string; label: string }) => sr.label === area);
          if (subRegion) {
            if (!subRegionsByRegion[region.value]) {
              subRegionsByRegion[region.value] = [];
            }
            subRegionsByRegion[region.value].push(subRegion.value);
            found = true;
            console.log(`✅ 通過 label 匹配: ${area} -> ${region.label} -> ${subRegion.value}`);
            break;
          }
        }
      }
      
      // 如果還是沒有找到，嘗試通過模糊匹配
      if (!found) {
        for (const region of REGION_OPTIONS) {
          const subRegion = region.regions?.find((sr: { value: string; label: string }) => 
            sr.label.includes(area) || area.includes(sr.label) ||
            sr.value.includes(area) || area.includes(sr.value)
          );
          if (subRegion) {
            if (!subRegionsByRegion[region.value]) {
              subRegionsByRegion[region.value] = [];
            }
            subRegionsByRegion[region.value].push(subRegion.value);
            found = true;
            console.log(`✅ 通過模糊匹配: ${area} -> ${region.label} -> ${subRegion.value}`);
            break;
          }
        }
      }
      
      // 如果還是沒有找到，記錄警告
      if (!found) {
        console.warn(`⚠️ 無法匹配地區: ${area}`);
      }
    });
    
    console.log('🔍 設置的地區狀態:', subRegionsByRegion);
    setSelectedSubRegionsByRegion(subRegionsByRegion);
  }
    } catch (error) {
      console.error('❌ 獲取資料失敗:', error);
      toast.error(error instanceof Error ? error.message : '獲取資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證表單是否包含聯絡資料
    const validation = validateFormSubmission(formData);
    if (!validation.isValid) {
      toast.error(validation.message);
      console.log('表單驗證失敗:', validation.violations);
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      await tutorApi.updateProfile(formData);
      
      // 觸發用戶數據更新事件
      window.dispatchEvent(new Event('userUpdate'));
      
      toast.success('資料更新成功，已即時生效');
      
      // 強制刷新頁面以確保數據更新
      window.location.reload();
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      toast.error(error instanceof Error ? error.message : '更新導師資料失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      // 從 localStorage 獲取 token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      // 使用 useUser hook 獲取的用戶資料
      if (!user) {
        throw new Error('找不到用戶資料');
      }
      // 使用 userId 而不是 id，因為後端 API 期望的是自定義的 userId
      const userId = user.userId || user.id;

      const data = await tutorApi.uploadAvatar(userId, file);
      setFormData(prev => ({
        ...prev,
        avatar: data.avatarUrl
      }));
      toast.success('照片上傳成功');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error instanceof Error ? error.message : '上傳照片失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'idCard' | 'educationCert') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 顯示個人信息保護提醒
    const confirmed = window.confirm(
      '⚠️ 個人信息保護提醒\n\n' +
      '請確保您上傳的文件中的個人信息（如姓名、身份證號、地址等）已經進行模糊處理。\n\n' +
      '建議處理方式：\n' +
      '• 使用圖片編輯軟件塗黑或模糊敏感信息\n' +
      '• 或使用貼紙遮蓋個人信息\n\n' +
      '確認您已處理好個人信息後，點擊「確定」繼續上傳。'
    );

    if (!confirmed) {
      // 清空文件輸入框
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('上傳文件失敗');
      
      const data = await response.json();
      
      if (type === 'idCard') {
        setFormData((prev: TutorProfile) => ({
          ...prev,
          documents: {
            ...prev.documents,
            idCard: data.url
          }
        }));
      } else {
        setFormData((prev: TutorProfile) => ({
          ...prev,
          documents: {
            ...prev.documents,
            educationCert: Array.isArray(prev.documents.educationCert) 
              ? [...prev.documents.educationCert, data.url]
              : [data.url]
          }
        }));
      }
      
      toast.success('文件上傳成功，請等待管理員審批');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('上傳文件失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleBirthDateChange = (type: 'year' | 'month' | 'day', value: number) => {
    if (type === 'year') setBirthYear(value);
    if (type === 'month') setBirthMonth(value);
    if (type === 'day') setBirthDay(value);

    if (type === 'year' || type === 'month') {
      setBirthDay(undefined);
    }

    if (birthYear && birthMonth && birthDay) {
      const newDate = new Date(birthYear, birthMonth - 1, birthDay);
      setFormData((prev: TutorProfile) => ({ ...prev, birthDate: newDate }));
    }
  };

  const handleSectionSave = async (section: string, data: any) => {
    try {
      // 驗證部分保存的數據是否包含聯絡資料
      const validation = validateFormSubmission(data);
      if (!validation.isValid) {
        toast.error(validation.message);
        console.log('部分保存驗證失敗:', validation.violations);
        return;
      }

      setSavingSection(section);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      await tutorApi.updateProfile(data);
      
      // 觸發用戶數據更新事件
      window.dispatchEvent(new Event('userUpdate'));
      
      toast.success('資料更新成功，已即時生效');
      
      // 強制刷新頁面以確保數據更新
      window.location.reload();
    } catch (error) {
      console.error('更新失敗:', error);
      toast.error(error instanceof Error ? error.message : '更新失敗，請稍後再試');
    } finally {
      setSavingSection(null);
    }
  };

  // 科目選擇相關函數
  const handleCategoryChange = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setSelectedSubCategory('');
  };

  const handleSubCategoryChange = (subCategoryValue: string) => {
    setSelectedSubCategory(subCategoryValue);
  };

  const handleSubjectToggle = (subjectValue: string) => {
    setNewSubjects((prev: string[]) => 
      prev.includes(subjectValue) 
        ? prev.filter(s => s !== subjectValue)
        : [...prev, subjectValue]
    );
  };

  const handleSubjectSave = async () => {
    try {
      await handleSectionSave('subjects', {
        subjects: newSubjects
      });
      setFormData((prev: TutorProfile) => ({ ...prev, subjects: newSubjects }));
      setShowSubjectEditor(false);
    } catch (error) {
      console.error('保存科目失敗:', error);
    }
  };

  // 教學模式相關函數
  const handleTeachingModeChange = (mode: string) => {
    setSelectedTeachingMode(mode);
    if (mode !== 'in-person' && mode !== 'both') {
      setSelectedRegion('');
      setSelectedSubRegionsByRegion({});
      setSelectedLocations([]);
    }
  };

  // 地區選擇相關函數
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handleSubRegionToggle = (subRegion: string) => {
    if (!selectedRegion) return;
    
    setSelectedSubRegionsByRegion(prev => {
      const currentSubRegions = prev[selectedRegion] || [];
      const newSubRegions = currentSubRegions.includes(subRegion)
        ? currentSubRegions.filter((r: string) => r !== subRegion)
        : [...currentSubRegions, subRegion];
      
      return {
        ...prev,
        [selectedRegion]: newSubRegions
      };
    });
  };

  // 獲取當前選中的子地區
  const getCurrentSubRegions = () => {
    return selectedSubRegionsByRegion[selectedRegion] || [];
  };

  // 獲取所有選中的子地區
  const getAllSelectedSubRegions = () => {
    return Object.values(selectedSubRegionsByRegion).flat();
  };



  // 時間選擇相關函數
  const handleAddTimeSlot = () => {
    if (selectedWeekday && selectedTimeSlot) {
      const weekdayLabel = WEEKDAYS.find(w => w.value === selectedWeekday)?.label;
      const timeLabel = TIME_SLOTS.find(t => t.value === selectedTimeSlot)?.label;
      const newTimeSlot = `${weekdayLabel} ${timeLabel}`;
      
      if (!newAvailableTimes.includes(newTimeSlot)) {
        setNewAvailableTimes((prev: string[]) => [...prev, newTimeSlot]);
      }
      
      setSelectedWeekday('');
      setSelectedTimeSlot('');
    }
  };

  const handleRemoveTimeSlot = (timeSlot: string) => {
    setNewAvailableTimes((prev: string[]) => prev.filter(t => t !== timeSlot));
  };

  const handleTimeSave = async () => {
    try {
      await handleSectionSave('time', {
        availableTime: newAvailableTimes
      });
      setFormData((prev: TutorProfile) => ({ ...prev, availableTime: newAvailableTimes }));
    } catch (error) {
      console.error('保存時間失敗:', error);
    }
  };

  // 證書公開性切換
  const handleCertificateVisibility = async (certUrl: string) => {
    // 檢查是否已通過審批
    if (formData.profileStatus !== 'approved') {
      toast.error('請先等待管理員審批通過後才能公開證書');
      return;
    }

    const newPublicCertificates = publicCertificates.includes(certUrl) 
      ? publicCertificates.filter(c => c !== certUrl)
      : [...publicCertificates, certUrl];
    
    setPublicCertificates(newPublicCertificates);
    
    try {
      const response = await fetch('/api/tutor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          publicCertificates: newPublicCertificates
        })
      });
      
      if (response.ok) {
        toast.success('證書公開設定已更新');
      } else {
        const error = await response.json();
        toast.error(error.message || '更新失敗');
      }
    } catch (error) {
      console.error('更新公開證書失敗:', error);
      toast.error('更新失敗，請稍後再試');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">載入中...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* 聯絡資料警告 */}
      <ContactInfoWarning className="mb-6" variant="detailed" />
      
      {/* 審批狀態顯示 */}
      {formData.profileStatus && formData.profileStatus !== 'approved' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {formData.profileStatus === 'pending' ? (
                  <>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-semibold text-yellow-700">資料審核中</h3>
                      <p className="text-sm text-gray-600">
                        您的資料已提交審核，請耐心等待管理員審批。審核通過後，您的資料將正式更新。
                      </p>
                    </div>
                  </>
                ) : formData.profileStatus === 'rejected' ? (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <h3 className="font-semibold text-red-700">資料被拒絕</h3>
                      <p className="text-sm text-gray-600">
                        {formData.remarks || '您的資料未通過審核，請檢查並重新提交。'}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
              
              {/* 手動刷新按鈕 */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await fetchTutorProfile();
                    toast.success('資料已更新');
                  } catch (error) {
                    toast.error('檢查失敗，請稍後再試');
                  }
                }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                檢查狀態
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 個人資料 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>個人資料</CardTitle>
            <Button
              type="button"
              onClick={() => handleSectionSave('personal', {
                name: formData.name,
                gender: formData.gender,
                birthDate: formData.birthDate,
                education: formData.education,
                experience: formData.experience,
                examResults: formData.examResults,
                qualifications: formData.qualifications,
                avatar: formData.avatar,
              })}
              disabled={savingSection === 'personal'}
            >
              {savingSection === 'personal' ? '保存中...' : '保存'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 個人照片 */}
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {formData.avatar ? (
                  <Image
                    src={formData.avatar}
                    alt="導師照片"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">上傳照片</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  建議上傳正方形照片，大小不超過 2MB
                </p>
              </div>
            </div>

            {/* 稱呼 */}
            <div className="space-y-2">
              <Label htmlFor="name">稱呼</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* 性別 */}
            <div className="space-y-2">
              <Label>性別</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="male"
                    checked={formData.gender === 'male'}
                    onCheckedChange={() => setFormData({ ...formData, gender: 'male' })}
                  />
                  <Label htmlFor="male">男</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="female"
                    checked={formData.gender === 'female'}
                    onCheckedChange={() => setFormData({ ...formData, gender: 'female' })}
                  />
                  <Label htmlFor="female">女</Label>
                </div>
              </div>
            </div>

            {/* 出生日期 */}
            <div className="space-y-2">
              <Label>出生日期</Label>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={birthYear?.toString() || ''}
                  onValueChange={(value) => handleBirthDateChange('year', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="年份" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={birthMonth?.toString() || ''}
                  onValueChange={(value) => handleBirthDateChange('month', parseInt(value))}
                  disabled={!birthYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="月份" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={birthDay?.toString() || ''}
                  onValueChange={(value) => handleBirthDateChange('day', parseInt(value))}
                  disabled={!birthYear || !birthMonth}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="日期" />
                  </SelectTrigger>
                  <SelectContent>
                    {birthYear && birthMonth && generateDayOptions(birthYear, birthMonth).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}日
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 學歷 */}
            <div className="space-y-2">
              <ValidatedInput
                label="學歷"
                value={formData.education}
                onChange={(value) => setFormData({ ...formData, education: value })}
                placeholder="請填寫你的學歷..."
                type="textarea"
                required
                maxLength={500}
              />
            </div>

            {/* 授課年資 */}
            <div className="space-y-2">
              <Label htmlFor="experience">授課年資</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                required
              />
            </div>

            {/* 相關科目公開試成績 */}
            <div className="space-y-2">
              <ValidatedInput
                label="相關科目公開試成績"
                value={formData.examResults}
                onChange={(value) => setFormData({ ...formData, examResults: value })}
                placeholder="請填寫你的公開試成績..."
                type="textarea"
                required
                maxLength={300}
              />
            </div>

            {/* 專業資格 */}
            <div className="space-y-2">
              <ValidatedInput
                label="專業資格"
                value={formData.qualifications.join('\n')}
                onChange={(value) => setFormData({ 
                  ...formData, 
                  qualifications: value.split('\n').filter(q => q.trim()) 
                })}
                placeholder="請填寫你的專業資格，每行一個...&#10;例如：&#10;香港大學教育學士&#10;IELTS 8.0&#10;Registered Teacher"
                type="textarea"
                rows={4}
                maxLength={1000}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    const newValue = value.substring(0, start) + '\n' + value.substring(end);
                    textarea.value = newValue;
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                    
                    // 觸發 onChange 事件
                    const event = new Event('input', { bubbles: true });
                    textarea.dispatchEvent(event);
                  }
                }}
              />
              <p className="text-sm text-gray-500">
                請每行填寫一個專業資格，例如：學歷、證書、認證等
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 個人介紹 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>個人介紹</CardTitle>
            <Button
              type="button"
              onClick={() => handleSectionSave('introduction', {
                introduction: formData.introduction,
                courseFeatures: formData.courseFeatures,
              })}
              disabled={savingSection === 'introduction'}
            >
              {savingSection === 'introduction' ? '保存中...' : '保存'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 個人簡介 */}
            <div className="space-y-2">
              <ValidatedInput
                label="個人簡介"
                value={formData.introduction}
                onChange={(value) => setFormData({ ...formData, introduction: value })}
                placeholder="請介紹你的教學經驗、專長等..."
                type="textarea"
                required
                maxLength={1000}
              />
            </div>

            {/* 課程特點 */}
            <div className="space-y-2">
              <ValidatedInput
                label="課程特點"
                value={formData.courseFeatures}
                onChange={(value) => setFormData({ ...formData, courseFeatures: value })}
                placeholder="請描述你的課程特點..."
                type="textarea"
                required
                maxLength={800}
              />
            </div>
          </CardContent>
        </Card>

        {/* 教學資料 */}
        <Card>
          <CardHeader>
            <CardTitle>教學資料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 教授科目 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>教授科目</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubjectEditor(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  更改
                </Button>
              </div>
              
              {/* 顯示當前科目 */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">當前可教授科目：</p>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects && formData.subjects.length > 0 ? (
                    formData.subjects.map((subject) => {
                      // 找到科目標籤
                      let subjectLabel = subject;
                      for (const category of CATEGORY_OPTIONS) {
                        if (category.subjects) {
                          const found = category.subjects.find(s => s.value === subject);
                          if (found) {
                            subjectLabel = `${category.label} > ${found.label}`;
                            break;
                          }
                        }
                        if (category.subCategories) {
                          for (const subCategory of category.subCategories) {
                            const found = subCategory.subjects.find(s => s.value === subject);
                            if (found) {
                              subjectLabel = `${category.label} > ${subCategory.label} > ${found.label}`;
                              break;
                            }
                          }
                        }
                      }
                      return (
                        <Badge key={subject} variant="secondary">
                          {subjectLabel}
                        </Badge>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">暫無可教授科目</p>
                  )}
                </div>
              </div>
            </div>

            {/* 上堂地點 */}
            <div className="space-y-4">
              <Label>上堂地點</Label>
              
              {/* 說明文字 */}
              <p className="text-sm text-gray-600">
                請選擇您願意前往授課的地區。您可以選擇多個地區，選擇完成後請點擊「保存地區選擇」按鈕。
              </p>
              
              {/* 操作提示 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>操作步驟：</strong>
                  <br />1. 先選擇主要地區（如：香港島、九龍、新界）
                  <br />2. 再選擇具體的子地區（如：中環、灣仔、銅鑼灣）
                  <br />3. 點擊「保存地區選擇」按鈕保存您的選擇
                </p>
                
                                                  {/* 簡化的操作按鈕 */}
                 <div className="mt-3 pt-3 border-t border-blue-200">
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={async () => {
                       try {
                         await fetchTutorProfile();
                         toast.success('導師資料已重新載入');
                       } catch (error) {
                         toast.error('載入失敗，請稍後再試');
                       }
                     }}
                   >
                     重新載入資料
                   </Button>
                 </div>
              </div>
              
                             {/* 顯示當前已選地區 */}
               {formData.teachingAreas && formData.teachingAreas.length > 0 && (
                 <div className="space-y-2">
                   <p className="text-sm text-gray-600">當前已選地區：</p>
                   <div className="flex flex-wrap gap-2">
                     {formData.teachingAreas.map((area) => {
                       // 創建地區名稱映射
                       const areaNameMap: { [key: string]: string } = {
                         'hong-kong-island-admiralty': '金鐘',
                         'hong-kong-island-tin-hau': '天后',
                         'hong-kong-island-taikoo': '太古',
                         'hong-kong-island-north-point': '北角',
                         'hong-kong-island-shau-kei-wan': '筲箕灣',
                         'hong-kong-island-chai-wan': '柴灣',
                         'kowloon-to-kwa-wan': '土瓜灣',
                         'kowloon-lok-fu': '樂富',
                         'new-territories-long-ping': '朗屏',
                         'hong-kong-island-tai-hang': '大坑',
                         'hong-kong-island-sai-wan-ho': '西灣河'
                       };
                       
                       // 優先使用映射
                       if (areaNameMap[area]) {
                         return (
                           <Badge key={area} variant="secondary">
                             {areaNameMap[area]}
                           </Badge>
                         );
                       }
                       
                       // 如果沒有映射，嘗試從路徑中提取並匹配
                       const pathParts = area.split('-');
                       let regionLabel = area;
                       
                       // 從後往前嘗試匹配
                       for (let i = pathParts.length - 1; i >= 0; i--) {
                         const partialPath = pathParts.slice(i).join('-');
                         for (const region of REGION_OPTIONS) {
                           const subRegion = region.regions?.find(sr => sr.value === partialPath);
                           if (subRegion) {
                             regionLabel = subRegion.label;
                             break;
                           }
                         }
                         if (regionLabel !== area) break;
                       }
                       
                       return (
                         <Badge key={area} variant="secondary">
                           {regionLabel}
                         </Badge>
                       );
                     })}
                   </div>
                 </div>
               )}
              
              <div className="space-y-4">
                {/* 地區選擇 */}
                <div className="space-y-2">
                  <Label>選擇地區</Label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇主要地區" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_OPTIONS.filter(region => region.value !== 'unlimited').map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* 顯示所有可選地區的提示 */}
                  <div className="text-sm text-gray-500">
                    可選地區包括：香港島、九龍、新界、離島等
                  </div>
                </div>

                {/* 子地區選擇 */}
                {selectedRegion && (
                  <div className="space-y-2">
                    <Label>選擇子地區</Label>
                    <p className="text-sm text-gray-500">
                      選擇 {REGION_OPTIONS.find(r => r.value === selectedRegion)?.label} 下的具體地區
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {REGION_OPTIONS.find(r => r.value === selectedRegion)?.regions?.map((subRegion: { value: string; label: string }) => (
                        <div key={subRegion.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={subRegion.value}
                            checked={getCurrentSubRegions().includes(subRegion.value)}
                            onCheckedChange={() => handleSubRegionToggle(subRegion.value)}
                          />
                          <Label htmlFor={subRegion.value} className="text-sm">
                            {subRegion.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已選地區顯示 */}
                {getAllSelectedSubRegions().length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">已選擇的地區：</p>
                    <div className="flex flex-wrap gap-2">
                      {getAllSelectedSubRegions().map((subRegion) => {
                        const regionLabel = REGION_OPTIONS.flatMap(r => r.regions || []).find(sr => sr.value === subRegion)?.label || subRegion;
                        return (
                          <Badge key={subRegion} variant="secondary">
                            {regionLabel}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    {/* 地區選擇總結 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>選擇總結：</strong>
                        <br />已選擇 {getAllSelectedSubRegions().length} 個地區
                        <br />包括：{Object.keys(selectedSubRegionsByRegion).map(regionKey => {
                          const region = REGION_OPTIONS.find(r => r.value === regionKey);
                          return region ? region.label : regionKey;
                        }).join('、')}
                      </p>
                    </div>
                    
                    {/* 按鈕組 */}
                    <div className="flex gap-2">
                      {/* 保存地區選擇按鈕 */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSectionSave('teachingAreas', {
                          tutorProfile: {
                            subRegions: getAllSelectedSubRegions().map(subRegion => {
                              // 將簡短名稱轉換為完整路徑格式
                              const region = REGION_OPTIONS.find(r => r.regions?.some(sr => sr.value === subRegion));
                              if (region) {
                                return `${region.value}-${subRegion}`;
                              }
                              return subRegion;
                            })
                          }
                        })}
                        disabled={savingSection === 'teachingAreas'}
                      >
                        {savingSection === 'teachingAreas' ? '保存中...' : '保存地區選擇'}
                      </Button>
                      
                      {/* 重置地區選擇按鈕 */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRegion('');
                          setSelectedSubRegionsByRegion({});
                        }}
                      >
                        重新選擇
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    請先選擇地區，然後點擊保存按鈕
                  </div>
                )}
              </div>
            </div>

            {/* 網上課程選項 */}
            <div className="space-y-4">
              <Label>網上課程</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="online-teaching"
                  checked={formData.teachingMethods.includes('online')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        teachingMethods: [...prev.teachingMethods, 'online']
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        teachingMethods: prev.teachingMethods.filter(m => m !== 'online')
                      }));
                    }
                  }}
                />
                <Label htmlFor="online-teaching">提供網上課程</Label>
              </div>
            </div>


            {/* 上堂時間 */}
            <div className="space-y-4">
              <Label>上堂時間</Label>
              
              {/* 顯示當前已選時間 */}
              {formData.availableTime && formData.availableTime.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">當前已選時間：</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.availableTime.map((timeSlot) => (
                      <Badge key={timeSlot} variant="secondary">
                        {timeSlot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 時間選擇器 */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-sm">星期</Label>
                  <Select value={selectedWeekday} onValueChange={setSelectedWeekday}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇星期" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label className="text-sm">時間段</Label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇時間" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTimeSlot}
                  disabled={!selectedWeekday || !selectedTimeSlot}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* 已選時間 */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">已選時間：</p>
                <div className="flex flex-wrap gap-2">
                  {newAvailableTimes.map((timeSlot) => (
                    <Badge key={timeSlot} variant="secondary" className="flex items-center gap-1">
                      {timeSlot}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleRemoveTimeSlot(timeSlot)}
                      />
                    </Badge>
                  ))}
                </div>
                {newAvailableTimes.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTimeSave}
                  >
                    保存時間設置
                  </Button>
                )}
              </div>
            </div>

            {/* 要求堂費 */}
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">要求堂費（每小時）</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                required
              />
            </div>

            {/* 保存按鈕 */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={() => handleSectionSave('teaching', {
                  subjects: formData.subjects,
                  teachingMethods: formData.teachingMethods,
                  tutorProfile: {
                    subRegions: getAllSelectedSubRegions().map(subRegion => {
                      // 將簡短名稱轉換為完整路徑格式
                      const region = REGION_OPTIONS.find(r => r.regions?.some(sr => sr.value === subRegion));
                      if (region) {
                        return `${region.value}-${subRegion}`;
                      }
                      return subRegion;
                    })
                  },
                  availableTime: formData.availableTime,
                  hourlyRate: formData.hourlyRate,
                })}
                disabled={savingSection === 'teaching'}
              >
                {savingSection === 'teaching' ? '保存中...' : '保存教學資料'}
              </Button>
            </div>
          </CardContent>
        </Card>



        {/* 文件上傳 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>文件上傳</CardTitle>
            <Button
              type="button"
              onClick={() => handleSectionSave('documents', {
                documents: formData.documents,
                publicCertificates: publicCertificates,
              })}
              disabled={savingSection === 'documents'}
            >
              {savingSection === 'documents' ? '保存中...' : '保存'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 身份證 */}
            <div className="space-y-4">
              <Label htmlFor="idCard">身份證</Label>
              <Input
                id="idCard"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleDocumentUpload(e, 'idCard')}
                disabled={uploading}
                required
              />
              {formData.documents.idCard && (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">已上傳</p>
                  <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                    <Image
                      src={formData.documents.idCard}
                      alt="身份證"
                      fill
                      className={cn(
                        "object-cover",
                        !showIdCard && "blur-sm"
                      )}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowIdCard(!showIdCard)}
                      >
                        {showIdCard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showIdCard ? '隱藏' : '查看'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 學歷證書 */}
            <div className="space-y-4">
              <Label htmlFor="educationCert">學歷證書</Label>
              <Input
                id="educationCert"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleDocumentUpload(e, 'educationCert')}
                disabled={uploading}
                required
              />
              {formData.documents.educationCert && (
                <div className="space-y-4">
                  {/* 確保 educationCert 是陣列 */}
                  {Array.isArray(formData.documents.educationCert) ? (
                    formData.documents.educationCert.length > 0 && (
                      <>
                        <p className="text-sm text-green-600">已上傳 {formData.documents.educationCert.length} 個文件</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.documents.educationCert.map((cert, index) => (
                            <div key={index} className="space-y-2">
                              <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                                <Image
                                  src={cert}
                                  alt={`證書 ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    console.error('圖片載入失敗:', cert);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // 顯示錯誤信息
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'flex items-center justify-center h-full bg-gray-100';
                                    errorDiv.innerHTML = `
                                      <div class="text-center">
                                        <div class="text-4xl mb-2">❌</div>
                                        <div class="text-sm text-gray-600">圖片載入失敗</div>
                                        <a href="${cert}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm underline">
                                          直接查看
                                        </a>
                                      </div>
                                    `;
                                    target.parentElement?.appendChild(errorDiv);
                                  }}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                {formData.profileStatus === 'approved' ? (
                                  <>
                                    <Checkbox
                                      id={`cert-${index}`}
                                      checked={publicCertificates.includes(cert)}
                                      onCheckedChange={() => handleCertificateVisibility(cert)}
                                    />
                                    <Label htmlFor={`cert-${index}`} className="text-sm">
                                      公開此證書（其他用戶可見，個人信息會被模糊處理）
                                    </Label>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    {formData.profileStatus === 'pending' 
                                      ? '⏳ 等待管理員審批通過後可公開證書'
                                      : formData.profileStatus === 'rejected'
                                      ? '❌ 資料未通過審批，無法公開證書'
                                      : '🔒 請先提交資料等待審批'
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  ) : (
                    // 如果是單一字串，顯示為單個證書
                    formData.documents.educationCert && (
                      <div className="space-y-2">
                        <p className="text-sm text-green-600">已上傳 1 個文件</p>
                        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
                          {(() => {
                            const fileUrl = formData.documents.educationCert as string;
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
                            const isPdf = /\.pdf$/i.test(fileUrl);
                            
                            if (isImage) {
                              return (
                                <Image
                                  src={fileUrl}
                                  alt="證書"
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    console.error('圖片載入失敗:', fileUrl);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // 顯示錯誤信息
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'flex items-center justify-center h-full bg-gray-100';
                                    errorDiv.innerHTML = `
                                      <div class="text-center">
                                        <div class="text-4xl mb-2">❌</div>
                                        <div class="text-sm text-gray-600">圖片載入失敗</div>
                                        <a href="${fileUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm underline">
                                          直接查看
                                        </a>
                                      </div>
                                    `;
                                    target.parentElement?.appendChild(errorDiv);
                                  }}
                                />
                              );
                            } else if (isPdf) {
                              return (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">📄</div>
                                    <div className="text-sm text-gray-600">PDF 文件</div>
                                    <a 
                                      href={fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                                    >
                                      查看文件
                                    </a>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">📎</div>
                                    <div className="text-sm text-gray-600">文件</div>
                                    <a 
                                      href={fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                                    >
                                      查看文件
                                    </a>
                                  </div>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {formData.profileStatus === 'approved' ? (
                            <>
                              <Checkbox
                                id="cert-0"
                                checked={publicCertificates.includes(formData.documents.educationCert as string)}
                                onCheckedChange={() => handleCertificateVisibility(formData.documents.educationCert as string)}
                              />
                              <Label htmlFor="cert-0" className="text-sm">
                                公開此證書（其他用戶可見，個人信息會被模糊處理）
                              </Label>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {formData.profileStatus === 'pending' 
                                ? '⏳ 等待管理員審批通過後可公開證書'
                                : formData.profileStatus === 'rejected'
                                ? '❌ 資料未通過審批，無法公開證書'
                                : '🔒 請先提交資料等待審批'
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* 科目編輯對話框 */}
      <Dialog open={showSubjectEditor} onOpenChange={setShowSubjectEditor}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>更改教授科目</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 分類選擇 */}
            <div className="space-y-4">
              <Label>課程分類</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇課程分類" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 子分類選擇 */}
            {selectedCategory && CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.subCategories && (
              <div className="space-y-4">
                <Label>子分類</Label>
                <Select value={selectedSubCategory} onValueChange={handleSubCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇子分類" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.subCategories?.map((subCategory) => (
                      <SelectItem key={subCategory.value} value={subCategory.value}>
                        {subCategory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 科目選擇 */}
            {selectedCategory && (
              <div className="space-y-4">
                <Label>科目</Label>
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const category = CATEGORY_OPTIONS.find(c => c.value === selectedCategory);
                    if (!category) return null;

                    if (category.subjects) {
                      return category.subjects.map((subject) => (
                        <div key={subject.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject.value}
                            checked={newSubjects.includes(subject.value)}
                            onCheckedChange={() => handleSubjectToggle(subject.value)}
                          />
                          <Label htmlFor={subject.value} className="text-sm">
                            {subject.label}
                          </Label>
                        </div>
                      ));
                    }

                    if (category.subCategories && selectedSubCategory) {
                      const subCategory = category.subCategories.find(sc => sc.value === selectedSubCategory);
                      if (subCategory) {
                        return subCategory.subjects.map((subject) => (
                          <div key={subject.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject.value}
                              checked={newSubjects.includes(subject.value)}
                              onCheckedChange={() => handleSubjectToggle(subject.value)}
                            />
                            <Label htmlFor={subject.value} className="text-sm">
                              {subject.label}
                            </Label>
                          </div>
                        ));
                      }
                    }

                    return null;
                  })()}
                </div>
              </div>
            )}

            {/* 已選科目 */}
            <div className="space-y-2">
              <Label>已選科目</Label>
              <div className="flex flex-wrap gap-2">
                {newSubjects.map((subject) => {
                  let subjectLabel = subject;
                  for (const category of CATEGORY_OPTIONS) {
                    if (category.subjects) {
                      const found = category.subjects.find(s => s.value === subject);
                      if (found) {
                        subjectLabel = `${category.label} > ${found.label}`;
                        break;
                      }
                    }
                    if (category.subCategories) {
                      for (const subCategory of category.subCategories) {
                        const found = subCategory.subjects.find(s => s.value === subject);
                        if (found) {
                          subjectLabel = `${category.label} > ${subCategory.label} > ${found.label}`;
                          break;
                        }
                      }
                    }
                  }
                  return (
                    <Badge key={subject} variant="secondary">
                      {subjectLabel}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSubjectEditor(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={handleSubjectSave}
              >
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 