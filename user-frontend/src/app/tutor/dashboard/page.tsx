'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 科目分類
const SUBJECT_CATEGORIES = {
  '數學': ['DSE 數學', 'IB 數學', 'A-Level 數學', '小學數學'],
  '物理': ['DSE 物理', 'IB 物理', 'A-Level 物理'],
  '化學': ['DSE 化學', 'IB 化學', 'A-Level 化學'],
  '生物': ['DSE 生物', 'IB 生物', 'A-Level 生物'],
  '英文': ['DSE 英文', 'IB 英文', 'A-Level 英文', 'IELTS', 'TOEFL'],
  '中文': ['DSE 中文', 'IB 中文', 'A-Level 中文', '普通話']
};

// 地區分類
const AREA_CATEGORIES = {
  '港島': ['中環', '金鐘', '銅鑼灣', '灣仔', '北角', '太古'],
  '九龍': ['旺角', '油麻地', '佐敦', '尖沙咀', '紅磡', '黃大仙'],
  '新界': ['沙田', '大埔', '將軍澳', '荃灣', '元朗', '屯門']
};

// 授課方式
const TEACHING_METHODS = [
  { value: 'face-to-face', label: '面授' },
  { value: 'online', label: '網上' },
  { value: 'mixed', label: '混合' }
];

// 可授課時間
const AVAILABLE_TIMES = [
  '星期一 上午',
  '星期一 下午',
  '星期一 晚上',
  '星期二 上午',
  '星期二 下午',
  '星期二 晚上',
  '星期三 上午',
  '星期三 下午',
  '星期三 晚上',
  '星期四 上午',
  '星期四 下午',
  '星期四 晚上',
  '星期五 上午',
  '星期五 下午',
  '星期五 晚上',
  '星期六 上午',
  '星期六 下午',
  '星期六 晚上',
  '星期日 上午',
  '星期日 下午',
  '星期日 晚上'
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
    educationCert: string;
  };
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
      educationCert: ''
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
      const response = await fetch('/api/tutors/profile');
      if (!response.ok) {
        throw new Error('獲取資料失敗');
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('獲取資料失敗:', error);
      toast.error('獲取資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/tutors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('更新導師資料失敗');
      
      toast.success('導師資料已更新');
      router.push('/tutors/' + formData.tutorId);
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      toast.error('更新導師資料失敗');
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
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('上傳照片失敗');
      
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        avatar: data.url
      }));
      toast.success('照片上傳成功');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('上傳照片失敗');
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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('上傳文件失敗');
      
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: data.url
        }
      }));
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
      // 如果年份或月份改變，重置日期
      setBirthDay(undefined);
    }

    // 當所有值都存在時，更新 formData
    if (birthYear && birthMonth && birthDay) {
      const newDate = new Date(birthYear, birthMonth - 1, birthDay);
      setFormData({ ...formData, birthDate: newDate });
    }
  };

  // 部分保存函數
  const handleSectionSave = async (section: string, data: Partial<TutorProfile>) => {
    try {
      setSavingSection(section);
      const response = await fetch('/api/tutors/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('更新失敗');
      }

      toast.success('更新成功');
    } catch (error) {
      console.error('更新失敗:', error);
      toast.error('更新失敗，請稍後再試');
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">載入中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
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
                {/* 年份選擇 */}
                <Select
                  value={birthYear?.toString()}
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

                {/* 月份選擇 */}
                <Select
                  value={birthMonth?.toString()}
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

                {/* 日期選擇 */}
                <Select
                  value={birthDay?.toString()}
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

            {/* 教授科目 */}
            <div className="space-y-2">
              <Label>教授科目</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(SUBJECT_CATEGORIES).map(([category, subjects]) => (
                  <div key={category} className="flex items-center space-x-2">
                    <div className="font-medium">{category}</div>
                    <div className="space-y-2">
                      {subjects.map((subject) => (
                        <div key={subject} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject}
                            checked={formData.subjects.includes(subject)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  subjects: [...formData.subjects, subject]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  subjects: formData.subjects.filter((s) => s !== subject)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={subject}>{subject}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

            {/* 上堂地區 */}
            <div className="space-y-2">
              <Label>上堂地區</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(AREA_CATEGORIES).map(([category, areas]) => (
                  <div key={category} className="flex items-center space-x-2">
                    <div className="font-medium">{category}</div>
                    <div className="space-y-2">
                      {areas.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={formData.teachingAreas.includes(area)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  teachingAreas: [...formData.teachingAreas, area]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  teachingAreas: formData.teachingAreas.filter((a) => a !== area)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={area}>{area}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 上堂時間 */}
            <div className="space-y-2">
              <Label>上堂時間</Label>
              <div className="grid grid-cols-2 gap-4">
                {AVAILABLE_TIMES.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={formData.availableTime.includes(time)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            availableTime: [...formData.availableTime, time]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            availableTime: formData.availableTime.filter((t) => t !== time)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={time}>{time}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 上堂形式 */}
            <div className="space-y-2">
              <Label>上堂形式</Label>
              <div className="grid grid-cols-2 gap-4">
                {TEACHING_METHODS.map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={method.value}
                      checked={formData.teachingMethods.includes(method.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            teachingMethods: [...formData.teachingMethods, method.value]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            teachingMethods: formData.teachingMethods.filter((m) => m !== method.value)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={method.value}>{method.label}</Label>
                  </div>
                ))}
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
                documents: {
                  idCard: formData.documents.idCard,
                  educationCert: formData.documents.educationCert,
                },
              })}
              disabled={savingSection === 'documents'}
            >
              {savingSection === 'documents' ? '保存中...' : '保存'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 身份證 */}
            <div className="space-y-2">
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
                <p className="text-sm text-green-600">已上傳</p>
              )}
            </div>

            {/* 學歷證書 */}
            <div className="space-y-2">
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
                <p className="text-sm text-green-600">已上傳</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 