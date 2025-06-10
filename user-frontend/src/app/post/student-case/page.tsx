'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { studentCaseApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';

const categories = [
  { id: 'preschool', name: '幼兒教育' },
  { id: 'primary', name: '小學教育' },
  { id: 'secondary', name: '中學教育' },
  { id: 'interest', name: '興趣班' },
  { id: 'tertiary', name: '大專補習課程' },
  { id: 'adult', name: '成人教育' }
];

const subjects = {
  preschool: [
    { id: 'preschool_general', name: '幼兒教育' }
  ],
  primary: [
    { id: 'primary_chinese', name: '中文' },
    { id: 'primary_english', name: '英文' },
    { id: 'primary_math', name: '數學' },
    { id: 'primary_general', name: '常識' }
  ],
  secondary: [
    { id: 'secondary_chinese', name: '中文' },
    { id: 'secondary_english', name: '英文' },
    { id: 'secondary_math', name: '數學' },
    { id: 'secondary_physics', name: '物理' },
    { id: 'secondary_chemistry', name: '化學' },
    { id: 'secondary_biology', name: '生物' },
    { id: 'secondary_economics', name: '經濟' },
    { id: 'secondary_accounting', name: '會計' }
  ],
  interest: [
    { id: 'interest_music', name: '音樂' },
    { id: 'interest_sports', name: '體育' },
    { id: 'interest_art', name: '美術' },
    { id: 'interest_dance', name: '舞蹈' }
  ],
  tertiary: [
    { id: 'tertiary_business', name: '商科' },
    { id: 'tertiary_science', name: '理科' },
    { id: 'tertiary_engineering', name: '工科' },
    { id: 'tertiary_language', name: '語言' }
  ],
  adult: [
    { id: 'adult_language', name: '語言' },
    { id: 'adult_music', name: '音樂' },
    { id: 'adult_art', name: '美術' },
    { id: 'adult_sports', name: '體育' }
  ]
};

const teachingModes = [
  { id: 'in_person', name: '面授' },
  { id: 'online', name: '網課' }
];

const minutesOptions = [15, 30, 45];

export default function PostStudentCase() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [startDate, setStartDate] = useState<Date>();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      if (selectedSubjects.length === 0) {
        toast.error('請選擇至少一個科目');
        return;
      }

      if (selectedModes.length === 0) {
        toast.error('請選擇至少一種教學模式');
        return;
      }

      if (!startDate) {
        toast.error('請選擇開始上堂日子');
        return;
      }

      const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
      if (totalMinutes < 30) {
        toast.error('每堂時長不能少於30分鐘');
        return;
      }

      const caseData = {
        ...data,
        category: selectedCategory,
        subjects: selectedSubjects,
        teachingModes: selectedModes,
        duration: {
          hours: parseInt(hours),
          minutes: parseInt(minutes)
        },
        startDate: startDate.toISOString(),
        status: 'open'
      };

      await studentCaseApi.create(caseData);
      toast.success('個案發布成功！');
      router.push('/find-tutor-cases');
    } catch (error) {
      console.error('發布個案失敗:', error);
      toast.error('發布個案失敗，請稍後再試');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubjects([]);
  };

  const handleSubjectChange = (subjectId: string) => {
    if (selectedCategory === 'primary' || selectedCategory === 'secondary') {
      setSelectedSubjects(prev => 
        prev.includes(subjectId) 
          ? prev.filter(id => id !== subjectId)
          : [...prev, subjectId]
      );
    } else {
      setSelectedSubjects([subjectId]);
    }
  };

  const handleModeChange = (modeId: string) => {
    setSelectedModes(prev =>
      prev.includes(modeId)
        ? prev.filter(id => id !== modeId)
        : [...prev, modeId]
    );
  };

  const formatDuration = (hours: number, minutes: number) => {
    if (hours === 0) {
      return `${minutes}分鐘`;
    }
    if (minutes === 0) {
      return `${hours}小時`;
    }
    return `${hours}小時${minutes}分鐘`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">尋導師</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個案標題
              </label>
              <Input
                {...register('title', { required: '請輸入個案標題' })}
                className="w-full"
                placeholder="請輸入個案標題"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分類
              </label>
              <Select onValueChange={handleCategoryChange} value={selectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  科目
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {subjects[selectedCategory as keyof typeof subjects]?.map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectChange(subject.id)}
                      />
                      <label
                        htmlFor={subject.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subject.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教學模式
              </label>
              <div className="grid grid-cols-2 gap-4">
                {teachingModes.map(mode => (
                  <div key={mode.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={mode.id}
                      checked={selectedModes.includes(mode.id)}
                      onCheckedChange={() => handleModeChange(mode.id)}
                    />
                    <label
                      htmlFor={mode.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {mode.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每堂時長
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-20"
                />
                <span>小時</span>
                <Select value={minutes} onValueChange={setMinutes}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="分鐘" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutesOptions.map(min => (
                      <SelectItem key={min} value={min.toString()}>
                        {min}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>分鐘</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每堂收費（港幣）
              </label>
              <Input
                type="number"
                {...register('price', { required: '請輸入每堂收費' })}
                className="w-full"
                placeholder="請輸入每堂收費"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每週堂數
              </label>
              <Input
                type="number"
                {...register('sessionsPerWeek', { required: '請輸入每週堂數' })}
                className="w-full"
                placeholder="請輸入每週堂數"
              />
              {errors.sessionsPerWeek && (
                <p className="mt-1 text-sm text-red-600">{errors.sessionsPerWeek.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始上堂日子
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : '選擇日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詳細描述
              </label>
              <Textarea
                {...register('description')}
                className="w-full"
                placeholder="請描述您的需求（選填）"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                返回
              </Button>
              <Button type="submit">
                發布
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 