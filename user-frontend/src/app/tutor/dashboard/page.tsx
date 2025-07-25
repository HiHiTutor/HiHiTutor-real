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
import { MultiSelect, Option } from '@/components/ui/multi-select';

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
const prepareLocationOptions = (): Option[] => {
  const options: Option[] = [];
  REGION_OPTIONS.filter(region => region.value !== 'unlimited').forEach((region) => {
    region.regions.forEach((area) => {
      options.push({
        value: area.value,
        label: `${region.label} > ${area.label}`
      });
    });
  });
  return options;
};

export default function TutorDashboardPage() {
  const router = useRouter();
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
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [newAvailableTimes, setNewAvailableTimes] = useState<string[]>([]);
  const [showIdCard, setShowIdCard] = useState(false);
  const [publicCertificates, setPublicCertificates] = useState<string[]>([]);

  useEffect(() => {
    fetchTutorProfile();
  }, []);

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

      const data = await tutorApi.getProfile();
      console.log('Fetched tutor profile data:', data); // 調試用
      console.log('Subjects from API:', data.subjects); // 調試用
      
      // 確保科目數據正確設置
      const subjects = data.subjects || [];
      const availableTime = data.availableTime || [];
      
      console.log('Processed subjects:', subjects); // 調試用
      
      setFormData({
        ...data,
        subjects: subjects,
        availableTime: availableTime,
        documents: {
          idCard: data.documents?.idCard || '',
          educationCert: data.certificateLogs?.map((log: any) => log.fileUrl) || data.documents?.educationCert || []
        }
      });
      setNewSubjects(subjects);
      setNewAvailableTimes(availableTime);
    } catch (error) {
      console.error('獲取資料失敗:', error);
      toast.error(error instanceof Error ? error.message : '獲取資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      await tutorApi.updateProfile(formData);
      
      toast.success('資料已提交審核，請等待管理員審批');
      await fetchTutorProfile();
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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('找不到用戶資料');
      }
      const user = JSON.parse(userStr);
      const userId = user.userId;

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
      
      toast.success('文件上傳成功');
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

  const handleSectionSave = async (section: string, data: Partial<TutorProfile>) => {
    try {
      setSavingSection(section);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登入');
      }

      await tutorApi.updateProfile(data);
      toast.success('成功提交更新，等待管理員審批');
      await fetchTutorProfile();
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

  const handleSubjectSave = () => {
    setFormData((prev: TutorProfile) => ({ ...prev, subjects: newSubjects }));
    setShowSubjectEditor(false);
  };

  // 教學模式相關函數
  const handleTeachingModeChange = (mode: string) => {
    setSelectedTeachingMode(mode);
    if (mode !== 'in-person') {
      setSelectedLocations([]);
    }
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

  const handleTimeSave = () => {
    setFormData((prev: TutorProfile) => ({ ...prev, availableTime: newAvailableTimes }));
  };

  // 證書公開性切換
  const handleCertificateVisibility = async (certUrl: string) => {
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
      {/* 審批狀態顯示 */}
      {formData.profileStatus && formData.profileStatus !== 'approved' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
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
                courseFeatures: formData.courseFeatures,
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
              <Label htmlFor="education">學歷</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="請填寫你的學歷..."
                required
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
              <Label htmlFor="examResults">相關科目公開試成績</Label>
              <Textarea
                id="examResults"
                value={formData.examResults}
                onChange={(e) => setFormData({ ...formData, examResults: e.target.value })}
                placeholder="請填寫你的公開試成績..."
                required
              />
            </div>

            {/* 專業資格 */}
            <div className="space-y-2">
              <Label htmlFor="qualifications">專業資格</Label>
              <Textarea
                id="qualifications"
                value={formData.qualifications.join('\n')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  qualifications: e.target.value.split('\n').filter(q => q.trim()) 
                })}
                placeholder="請填寫你的專業資格，每行一個...&#10;例如：&#10;香港大學教育學士&#10;IELTS 8.0&#10;Registered Teacher"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                請每行填寫一個專業資格，例如：學歷、證書、認證等
              </p>
            </div>

            {/* 課程特點 */}
            <div className="space-y-2">
              <Label htmlFor="courseFeatures">課程特點</Label>
              <Textarea
                id="courseFeatures"
                value={formData.courseFeatures}
                onChange={(e) => setFormData({ ...formData, courseFeatures: e.target.value })}
                placeholder="請描述你的課程特點，例如：&#10;- 互動式教學&#10;- 個性化學習計劃&#10;- 豐富的練習材料&#10;- 定期進度評估"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                描述你的教學特色和課程優勢，讓學生更了解你的教學風格
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 教學資料 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>教學資料</CardTitle>
            <Button
              type="button"
              onClick={() => handleSectionSave('teaching', {
                subjects: formData.subjects,
                teachingMethods: formData.teachingMethods,
                teachingAreas: formData.teachingAreas,
                availableTime: formData.availableTime,
                hourlyRate: formData.hourlyRate,
              })}
              disabled={savingSection === 'teaching'}
            >
              {savingSection === 'teaching' ? '保存中...' : '保存'}
            </Button>
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

            {/* 教學模式 */}
            <div className="space-y-4">
              <Label>教學模式</Label>
              <Select value={selectedTeachingMode} onValueChange={handleTeachingModeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇教學模式" />
                </SelectTrigger>
                <SelectContent>
                  {TEACHING_MODE_OPTIONS.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 已選教學模式 */}
              <div className="flex flex-wrap gap-2">
                {formData.teachingMethods.map((method) => {
                  const methodLabel = TEACHING_MODE_OPTIONS.find(m => m.value === method)?.label || method;
                  return (
                    <Badge key={method} variant="secondary">
                      {methodLabel}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* 上堂地點（面授或皆可時顯示） */}
            {(selectedTeachingMode === 'in-person' || selectedTeachingMode === 'both') && (
              <div className="space-y-4">
                <Label>上堂地點</Label>
                <MultiSelect
                  options={prepareLocationOptions()}
                  selected={selectedLocations}
                  onChange={setSelectedLocations}
                  placeholder="選擇上堂地點..."
                />
              </div>
            )}

            {/* 上堂時間 */}
            <div className="space-y-4">
              <Label>上堂時間</Label>
              
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
              <Label htmlFor="introduction">個人簡介</Label>
              <Textarea
                id="introduction"
                value={formData.introduction}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                placeholder="請介紹你的教學經驗、專長等..."
                required
              />
            </div>

            {/* 課程特點 */}
            <div className="space-y-2">
              <Label htmlFor="courseFeatures">課程特點</Label>
              <Textarea
                id="courseFeatures"
                value={formData.courseFeatures}
                onChange={(e) => setFormData({ ...formData, courseFeatures: e.target.value })}
                placeholder="請描述你的課程特點..."
                required
              />
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
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`cert-${index}`}
                                  checked={publicCertificates.includes(cert)}
                                  onCheckedChange={() => handleCertificateVisibility(cert)}
                                />
                                <Label htmlFor={`cert-${index}`} className="text-sm">
                                  公開此證書（其他用戶可見，個人信息會被模糊處理）
                                </Label>
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
                        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                          <Image
                            src={formData.documents.educationCert}
                            alt="證書"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="cert-0"
                            checked={publicCertificates.includes(formData.documents.educationCert as string)}
                            onCheckedChange={() => handleCertificateVisibility(formData.documents.educationCert as string)}
                          />
                          <Label htmlFor="cert-0" className="text-sm">
                            公開此證書（其他用戶可見，個人信息會被模糊處理）
                          </Label>
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