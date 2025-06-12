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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export default function TutorDashboardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TutorProfile>({
    tutorId: '',
    birthDate: undefined,
    subjects: [],
    teachingAreas: [],
    teachingMethods: [],
    experience: 0,
    introduction: '',
    education: '',
    qualifications: [],
    hourlyRate: 0,
    availableTime: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutors/profile');
      if (!response.ok) throw new Error('獲取導師資料失敗');
      
      const data = await response.json();
      setFormData({
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined
      });
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
      toast.error('獲取導師資料失敗');
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

  if (loading) {
    return <div className="container mx-auto py-8 text-center">載入中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 教學資料 */}
        <Card>
          <CardHeader>
            <CardTitle>教學資料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 教授科目 */}
            <div className="space-y-4">
              <Label>教授科目</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(SUBJECT_CATEGORIES).map(([category, subjects]) => (
                  <div key={category} className="space-y-2">
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

            {/* 授課方式 */}
            <div className="space-y-4">
              <Label>授課方式</Label>
              <div className="flex flex-wrap gap-4">
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

            {/* 教學地區 */}
            {formData.teachingMethods.includes('face-to-face') && (
              <div className="space-y-4">
                <Label>教學地區</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(AREA_CATEGORIES).map(([category, areas]) => (
                    <div key={category} className="space-y-2">
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
            )}

            {/* 教學經驗 */}
            <div className="space-y-2">
              <Label htmlFor="experience">教學經驗（年）</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                required
              />
            </div>

            {/* 時薪 */}
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">時薪（港幣）</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                required
              />
            </div>

            {/* 可授課時間 */}
            <div className="space-y-4">
              <Label>可授課時間</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          </CardContent>
        </Card>

        {/* 個人簡介 */}
        <Card>
          <CardHeader>
            <CardTitle>個人簡介</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 簡介 */}
            <div className="space-y-2">
              <Label htmlFor="introduction">簡介</Label>
              <Textarea
                id="introduction"
                value={formData.introduction}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                placeholder="請介紹你的教學經驗、專長等..."
                required
              />
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
                placeholder="請填寫你的專業資格，每行一個..."
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? '儲存中...' : '儲存更改'}
          </Button>
        </div>
      </form>
    </div>
  );
} 