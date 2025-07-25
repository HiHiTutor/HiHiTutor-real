'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { cn } from '@/lib/utils';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import { REGION_OPTIONS } from '@/constants/regionOptions';
import { Label } from '@/components/ui/label';
import { TEACHING_MODE_OPTIONS, initializeTeachingModeOptions } from '@/constants/teachingModeOptions';

const formSchema = z.object({
  title: z.string({
    required_error: '請輸入此欄位',
    invalid_type_error: '請輸入此欄位'
  }).min(1, '請輸入此欄位'),
  description: z.string().optional(),
  category: z.string({
    required_error: '請輸入此欄位',
    invalid_type_error: '請輸入此欄位'
  }).min(1, '請輸入此欄位'),
  subCategory: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  modes: z.array(z.string(), {
    required_error: '請輸入此欄位',
    invalid_type_error: '請輸入此欄位'
  }).min(1, '請輸入此欄位'),
  regions: z.array(z.string()).optional(),
  subRegions: z.array(z.string()).optional(),
  price: z.coerce.number({
    invalid_type_error: '請輸入此欄位',
    required_error: '請輸入此欄位'
  }).min(1, '請輸入此欄位'),
  lessonDuration: z.object({
    hours: z.coerce.number({
      invalid_type_error: '請輸入此欄位',
      required_error: '請輸入此欄位'
    }).min(0, '請輸入此欄位').max(12, '請輸入此欄位'),
    minutes: z.coerce.number({
      invalid_type_error: '請輸入此欄位',
      required_error: '請輸入此欄位'
    }).min(0, '請輸入此欄位').max(59, '請輸入此欄位')
  }).refine((data) => {
    // 只要總時長>0即可
    return (data.hours * 60 + data.minutes) > 0;
  }, {
    message: "請輸入此欄位",
    path: ["minutes"]
  }),
  weeklyLessons: z.coerce.number({
    invalid_type_error: '請輸入此欄位',
    required_error: '請輸入此欄位'
  }).min(1, '請輸入此欄位'),
  startDate: z.date({
    invalid_type_error: '請輸入此欄位',
    required_error: '請輸入此欄位'
  })
}).refine((data) => {
  // 如果是中小學教育，則子分類和科目都是必填
  if (data.category === 'primary-secondary') {
    return (data.subCategory && data.subCategory.length > 0) && 
           (data.subjects && data.subjects.length > 0);
  }
  // 對於其他有科目選項的分類，也需要選擇至少一個科目
  if (data.category && data.category !== 'unlimited' && data.category !== 'primary-secondary') {
    return (data.subjects && data.subjects.length > 0);
  }
  return true;
}, {
  message: "請輸入此欄位",
  path: ["subjects"] // 錯誤顯示在科目欄位
});

type FormData = z.infer<typeof formSchema>;

export default function PostStudentCase() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>(''); // 改為單選
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);

  // 初始化教學模式選項
  useEffect(() => {
    const initTeachingModes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/teaching-modes`);
        if (response.ok) {
          const data = await response.json();
          setTeachingModeOptions(data);
        } else {
          // 如果 API 失敗，使用預設值
          setTeachingModeOptions([
            { 
              value: 'in-person', 
              label: '面授',
              subCategories: [
                { value: 'one-on-one', label: '一對一' },
                { value: 'small-group', label: '小班教學' },
                { value: 'large-center', label: '補習社' }
              ]
            },
            { 
              value: 'online', 
              label: '網課',
              subCategories: []
            },
            { 
              value: 'both', 
              label: '皆可',
              subCategories: [
                { value: 'one-on-one', label: '一對一' },
                { value: 'small-group', label: '小班教學' },
                { value: 'large-center', label: '補習社' }
              ]
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch teaching mode options:', error);
        // 使用預設值
        setTeachingModeOptions([
          { 
            value: 'in-person', 
            label: '面授',
            subCategories: [
              { value: 'one-on-one', label: '一對一' },
              { value: 'small-group', label: '小班教學' },
              { value: 'large-center', label: '補習社' }
            ]
          },
          { 
            value: 'online', 
            label: '網課',
            subCategories: []
          },
          { 
            value: 'both', 
            label: '皆可',
            subCategories: [
              { value: 'one-on-one', label: '一對一' },
              { value: 'small-group', label: '小班教學' },
              { value: 'large-center', label: '補習社' }
            ]
          }
        ]);
      }
    };
    
    initTeachingModes();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const watchModes = watch('modes');

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // 確保時長數據正確
      const hours = data.lessonDuration.hours || 0;
      const minutes = data.lessonDuration.minutes || 0;
      const totalMinutes = (hours * 60) + minutes;
      
      // 驗證時長
      if (totalMinutes === 0) {
        toast.error('請輸入有效的時長');
        return;
      }
      
      if (hours === 0 && (minutes === 0 || minutes === 15)) {
        toast.error('當小時為0時，分鐘只能選擇30或45');
        return;
      }

      // 確保所有必要欄位都有值
      const caseData = {
        id: `S${Date.now()}`,
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        subCategory: data.subCategory || '',
        subjects: data.subjects || [],
        modes: data.modes || [],
        regions: (data.regions && data.regions.length > 0) ? data.regions : ['all-hong-kong'],
        subRegions: data.subRegions || [],
        price: data.price || 0,
        // 將時長轉換為分鐘
        duration: totalMinutes,
        durationUnit: 'minutes',
        weeklyLessons: data.weeklyLessons || 1,
        startDate: data.startDate || new Date(),
        status: 'open',
        // 添加其他必要欄位
        budget: (data.price || 0).toString(),
        mode: (data.modes || []).includes('in-person') ? 'in-person' : 'online',
        requirement: data.description || '',
        requirements: data.description || '',
        region: data.regions || [],
        priceRange: `${data.price || 0}-${data.price || 0}`,
        featured: false,
        isVip: false,
        vipLevel: 0,
        isTop: false,
        topLevel: 0,
        ratingScore: 0,
        ratingCount: 0,
        isPaid: false,
        paymentType: 'free',
        promotionLevel: 0,
        isApproved: true
      };

      console.log('發送個案數據:', caseData);
      console.log('驗證必填欄位:', {
        title: caseData.title,
        category: caseData.category,
        modes: caseData.modes,
        price: caseData.price,
        duration: caseData.duration,
        weeklyLessons: caseData.weeklyLessons
      });
      
      await studentCaseApi.createStudentCase(caseData);
      toast.success('成功發布個案！');
      router.push('/find-tutor-cases');
    } catch (error) {
      console.error('發布個案失敗:', error);
      toast.error('發布個案失敗，請稍後再試');
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory('');
    setValue('category', value);
    setValue('subCategory', '');
    setValue('subjects', []);
  };

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value);
    setValue('subCategory', value);
    setValue('subjects', []);
  };

  const handleModeChange = (mode: string) => {
    // 檢查是否是面授的子分類
    const isInPersonSubCategory = ['one-on-one', 'small-group', 'large-center'].includes(mode);
    
    if (isInPersonSubCategory) {
      // 如果是面授子分類，保持面授選中，並切換子分類的選中狀態
      const currentModes = getValues('modes') || [];
      const newModes = currentModes.includes(mode)
        ? currentModes.filter(m => m !== mode)
        : [...currentModes.filter(m => !['one-on-one', 'small-group', 'large-center'].includes(m)), mode];
      
      // 確保面授始終被選中
      if (!newModes.includes('in-person')) {
        newModes.push('in-person');
      }
      
      setSelectedMode('in-person');
      setValue('modes', newModes);
    } else {
      // 如果是主分類，直接設置
      setSelectedMode(mode);
      setValue('modes', [mode]);
    }
  };

  const handleSubjectChange = (subject: string) => {
    const currentSubjects = getValues('subjects') || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    setValue('subjects', newSubjects);
  };

  const selectedCategoryData = CATEGORY_OPTIONS.find(cat => cat.value === selectedCategory);
  const selectedSubCategoryData = selectedCategoryData?.subCategories?.find(
    sub => sub.value === selectedSubCategory
  );

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
                  {CATEGORY_OPTIONS.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message as string}</p>
              )}
            </div>

            {selectedCategoryData?.subCategories && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  子分類
                </label>
                <Select onValueChange={handleSubCategoryChange} value={selectedSubCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategoryData.subCategories.map(subCategory => (
                      <SelectItem key={subCategory.value} value={subCategory.value}>
                        {subCategory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.subCategory.message as string}</p>
                )}
              </div>
            )}

            {/* 顯示科目選擇 - 中小學教育需要選擇子分類，其他類別直接顯示 */}
            {((selectedCategory === 'primary-secondary' && selectedSubCategory) || 
              (selectedCategory !== 'primary-secondary' && selectedCategory)) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  科目
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(selectedCategory === 'primary-secondary' 
                    ? selectedSubCategoryData?.subjects || []
                    : selectedCategoryData?.subjects || []
                  ).map(subject => (
                    <div key={subject.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.value}
                        checked={(watch('subjects') || []).includes(subject.value)}
                        onCheckedChange={(checked) => {
                          handleSubjectChange(subject.value);
                        }}
                      />
                      <label
                        htmlFor={subject.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subject.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.subjects && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjects.message as string}</p>
                )}
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.subCategory.message as string}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>教學模式</Label>
              <div className="flex gap-4">
                {teachingModeOptions.map(mode => (
                  <div key={mode.value} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={mode.value}
                        checked={selectedMode === mode.value}
                        onCheckedChange={() => handleModeChange(mode.value)}
                      />
                      <label
                        htmlFor={mode.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {mode.label}
                      </label>
                    </div>
                    {/* 顯示面授子分類 */}
                    {mode.value === 'in-person' && selectedMode === 'in-person' && (
                      <div className="ml-4 space-y-1">
                        {mode.subCategories.map((subMode: { value: string; label: string }) => (
                          <div key={subMode.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={subMode.value}
                              checked={(watch('modes') || []).includes(subMode.value)}
                              onCheckedChange={() => handleModeChange(subMode.value)}
                            />
                            <label
                              htmlFor={subMode.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subMode.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.modes && (
                <p className="text-sm text-red-500">{errors.modes.message}</p>
              )}
            </div>

            {(selectedMode === 'in-person' || selectedMode === 'both' || selectedMode === 'one-on-one' || selectedMode === 'small-group' || selectedMode === 'large-center') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上堂地區
                  </label>
                  <Select onValueChange={(value) => {
                    const newRegions = selectedRegions.includes(value)
                      ? selectedRegions.filter(r => r !== value)
                      : [...selectedRegions, value];
                    setSelectedRegions(newRegions);
                    setValue('regions', newRegions);
                    setSelectedSubRegions([]);
                    setValue('subRegions', []);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇地區" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_OPTIONS.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{region.label}</span>
                            {selectedRegions.includes(region.value) && (
                              <span className="text-blue-500">✓</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRegions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRegions.map(regionValue => {
                        const region = REGION_OPTIONS.find(r => r.value === regionValue);
                        return (
                          <span
                            key={regionValue}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {region?.label}
                            <button
                              type="button"
                              onClick={() => {
                                const newRegions = selectedRegions.filter(r => r !== regionValue);
                                setSelectedRegions(newRegions);
                                setValue('regions', newRegions);
                                setSelectedSubRegions([]);
                                setValue('subRegions', []);
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {errors.regions && (
                    <p className="mt-1 text-sm text-red-600">{errors.regions.message as string}</p>
                  )}
                </div>

                {selectedRegions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分區
                    </label>
                    <Select onValueChange={(value) => {
                      const newSubRegions = selectedSubRegions.includes(value)
                        ? selectedSubRegions.filter(r => r !== value)
                        : [...selectedSubRegions, value];
                      setSelectedSubRegions(newSubRegions);
                      setValue('subRegions', newSubRegions);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇分區" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRegions.map(regionValue => {
                          const region = REGION_OPTIONS.find(r => r.value === regionValue);
                          return region?.regions.map(subRegion => (
                            <SelectItem key={subRegion.value} value={subRegion.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{subRegion.label}</span>
                                {selectedSubRegions.includes(subRegion.value) && (
                                  <span className="text-blue-500">✓</span>
                                )}
                              </div>
                            </SelectItem>
                          ));
                        })}
                      </SelectContent>
                    </Select>
                    {selectedSubRegions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSubRegions.map(subRegionValue => {
                          const subRegion = selectedRegions.flatMap(regionValue => {
                            const region = REGION_OPTIONS.find(r => r.value === regionValue);
                            return region?.regions || [];
                          }).find(sr => sr.value === subRegionValue);
                          return (
                            <span
                              key={subRegionValue}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {subRegion?.label}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSubRegions = selectedSubRegions.filter(r => r !== subRegionValue);
                                  setSelectedSubRegions(newSubRegions);
                                  setValue('subRegions', newSubRegions);
                                }}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {errors.subRegions && (
                      <p className="mt-1 text-sm text-red-600">{errors.subRegions.message as string}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>每堂時長</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="12"
                    placeholder="小時"
                    {...register('lessonDuration.hours', {
                      onChange: (e) => {
                        const hours = parseInt(e.target.value) || 0;
                        const currentMinutes = watch('lessonDuration.minutes') || 0;
                        const minuteOptions = hours === 0 ? [30, 45] : [0, 15, 30, 45];
                        
                        // 如果當前選中的分鐘不在新的可用選項中，則清空
                        if (!minuteOptions.includes(currentMinutes)) {
                          setValue('lessonDuration.minutes', 0);
                        }
                      }
                    })}
                  />
                  {errors.lessonDuration?.hours && (
                    <p className="text-sm text-red-500">{errors.lessonDuration.hours.message}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Select 
                    onValueChange={(value) => {
                      const minutes = Number(value);
                      setValue('lessonDuration.minutes', isNaN(minutes) ? 0 : minutes);
                    }}
                    value={String(watch('lessonDuration.minutes') ?? '')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="分鐘" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const hours = watch('lessonDuration.hours') || 0;
                        const minuteOptions = hours === 0 ? [30, 45] : [0, 15, 30, 45];
                        return minuteOptions.map(minute => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute} 分鐘
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  {errors.lessonDuration?.minutes && (
                    <p className="text-sm text-red-500">{errors.lessonDuration.minutes.message}</p>
                  )}
                </div>
              </div>
              {errors.lessonDuration && typeof errors.lessonDuration.message === 'string' && (
                <p className="text-sm text-red-500">{errors.lessonDuration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>每週堂數</Label>
              <Input
                type="number"
                min="1"
                placeholder="請輸入每週堂數"
                {...register('weeklyLessons', { valueAsNumber: true })}
              />
              {errors.weeklyLessons && (
                <p className="text-sm text-red-500">{errors.weeklyLessons.message}</p>
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
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watch('startDate') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('startDate') ? format(watch('startDate')!, "PPP") : "選擇日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watch('startDate') || undefined}
                    onSelect={(date) => date && setValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>詳細描述</Label>
              <Textarea
                placeholder="請描述您的需求（選填）"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>每堂收費（港幣）</Label>
              <Input
                type="number"
                min="1"
                placeholder="請輸入每堂收費"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
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