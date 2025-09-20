'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useUser } from '@/hooks/useUser';

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
  }).min(1, '請輸入此欄位').refine((modes) => {
    // 允許的模式值
    const validModes = ['in-person', 'online', 'both'];
    return modes.every(mode => validModes.includes(mode));
  }, {
    message: '請選擇有效的教學模式'
  }),
  regions: z.array(z.string()).optional(),
  subRegions: z.array(z.string()).optional(),
  detailedAddress: z.string().optional(),
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
    return (data.subCategory && data.subCategory !== '') && 
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
}).refine((data) => {
  // 如果選擇面授或皆可，則地區是必填的
  if (data.modes && (data.modes.includes('in-person') || data.modes.includes('both'))) {
    return (data.regions && data.regions.length > 0);
  }
  return true;
}, {
  message: "請選擇上堂地區",
  path: ["regions"] // 錯誤顯示在地區欄位
});

type FormData = z.infer<typeof formSchema>;

export default function PostStudentCase() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, error } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedModes, setSelectedModes] = useState<string[]>(['both']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [selectedTeachingSubCategories, setSelectedTeachingSubCategories] = useState<string[]>([]);
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // 檢查用戶登入狀態
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('請先登入');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // 處理錯誤狀態
  useEffect(() => {
    if (error && (error.includes('登入已過期') || error.includes('Not authenticated'))) {
      toast.error('登入已過期，請重新登入');
      router.push('/login');
    }
  }, [error, router]);

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
    resolver: zodResolver(formSchema),
    defaultValues: {
      modes: ['both'] // 預設選擇「皆可」
    }
  });

  const watchModes = watch('modes');

  // 處理URL參數預設值
  useEffect(() => {
    if (searchParams) {
      const category = searchParams.get('category');
      const subjects = searchParams.getAll('subjects');
      
      if (category && category !== 'unlimited') {
        setSelectedCategory(category);
        setValue('category', category);
      }
      
      if (subjects.length > 0) {
        setValue('subjects', subjects);
      }
    }
  }, [searchParams, setValue]);

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

      // 檢查用戶登入狀態
      if (!user) {
        toast.error('請先登入');
        router.push('/login');
        return;
      }

      // 確保所有必要欄位都有值
      const caseData = {
        id: `S${Date.now()}`,
        student: user.id, // 使用 useUser hook 獲取的用戶ID
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
        detailedAddress: data.detailedAddress || '',
        status: 'open',
        // 添加其他必要欄位
        budget: (data.price || 0).toString(),
        mode: (data.modes || []).includes('in-person') ? 'in-person' : 'online',
        requirement: '',
        requirements: '',
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
      setShowSuccessModal(true);
      
      // 5秒後自動跳轉到 find-student-cases 頁面
      setTimeout(() => {
        router.push('/find-student-cases');
      }, 5000);
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
    
    // 只有在分類的子分類變化時才清空科目，教學模式的子分類變化不影響科目
    if (selectedCategory === 'primary-secondary') {
      setValue('subjects', []);
    }
    
    // 如果是教學模式的子分類，也要更新 modes
    if (['one-on-one', 'small-group', 'large-center'].includes(value)) {
      const currentModes = getValues('modes') || [];
      const newModes = [...currentModes.filter(m => !['one-on-one', 'small-group', 'large-center'].includes(m)), value];
      setValue('modes', newModes);
    }
  };

  const handleModeChange = (mode: string) => {
    // 只處理主教學模式（面授、網課、皆可）
    setSelectedModes([mode]);
    setValue('modes', [mode]);
    // 當切換主模式時，清空教學模式子分類
    setSelectedTeachingSubCategories([]);
  };

  const handleTeachingSubCategoryChange = (value: string) => {
    const newTeachingSubCategories = selectedTeachingSubCategories.includes(value)
      ? selectedTeachingSubCategories.filter(cat => cat !== value)
      : [...selectedTeachingSubCategories, value];
    setSelectedTeachingSubCategories(newTeachingSubCategories);
  };

  const handleSubjectChange = (subject: string) => {
    const currentSubjects = getValues('subjects') || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    setValue('subjects', newSubjects);
  };

  const selectedCategoryData = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(cat => cat.value === selectedCategory) : null;
  const selectedSubCategoryData = selectedCategoryData?.subCategories ? 
    (Array.isArray(selectedCategoryData.subCategories) ? selectedCategoryData.subCategories.find(sub => sub.value === selectedSubCategory) : null) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">尋導師</h1>
          <p className="text-gray-600 mb-8">
            請填寫課堂要求，配對專員核實後，會協助刊登於本平台的「補習個案」。配對專員將與有興趣申請個案的導師接洽課堂安排。
          </p>
          
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
                  ).map((subject: any) => (
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
                              <Select onValueChange={(value) => handleModeChange(value)} value={selectedModes[0] || 'both'}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇教學模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">面授</SelectItem>
                  <SelectItem value="online">網課</SelectItem>
                  <SelectItem value="both">皆可</SelectItem>
                </SelectContent>
              </Select>
              {errors.modes && (
                <p className="text-sm text-red-500">{errors.modes.message}</p>
              )}
            </div>

            {/* 子分類選擇 - 只在選擇面授或皆可時顯示 */}
            {(selectedModes.includes('in-person') || selectedModes.includes('both')) && (
              <div className="space-y-2">
                <Label>子分類（可多選）</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teaching-one-on-one"
                      checked={selectedTeachingSubCategories.includes('one-on-one')}
                      onCheckedChange={(checked) => {
                        handleTeachingSubCategoryChange('one-on-one');
                      }}
                    />
                    <label
                      htmlFor="teaching-one-on-one"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      一對一
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teaching-small-group"
                      checked={selectedTeachingSubCategories.includes('small-group')}
                      onCheckedChange={(checked) => {
                        handleTeachingSubCategoryChange('small-group');
                      }}
                    />
                    <label
                      htmlFor="teaching-small-group"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      小班教學
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teaching-large-center"
                      checked={selectedTeachingSubCategories.includes('large-center')}
                      onCheckedChange={(checked) => {
                        handleTeachingSubCategoryChange('large-center');
                      }}
                    />
                    <label
                      htmlFor="teaching-large-center"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      補習社
                    </label>
                  </div>
                </div>
              </div>
            )}

            {(selectedModes.includes('in-person') || selectedModes.includes('both')) && (
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
                        const region = Array.isArray(REGION_OPTIONS) ? REGION_OPTIONS.find(r => r.value === regionValue) : null;
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
                          const region = Array.isArray(REGION_OPTIONS) ? REGION_OPTIONS.find(r => r.value === regionValue) : null;
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
                            const region = Array.isArray(REGION_OPTIONS) ? REGION_OPTIONS.find(r => r.value === regionValue) : null;
                            return region?.regions || [];
                          }).filter(Array.isArray).flat().find(sr => sr.value === subRegionValue);
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

                {/* 詳細地址 - 僅面授或皆可時顯示 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詳細地址（可選）
                  </label>
                  <Textarea
                    {...register('detailedAddress')}
                    placeholder="請輸入詳細地址，例如：九龍塘窩打老道123號ABC大廈5樓A室"
                    className="w-full"
                    rows={3}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    此地址僅供配對專員參考，不會公開顯示
                  </p>
                </div>
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
                遞交個案
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 成功提交視窗 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              提交成功
            </h3>
            <p className="text-gray-600 mb-4">
              你已成功提交個案，配對專員會盡快聯絡閣下。
            </p>
            <div className="text-sm text-gray-500">
              5秒後自動跳轉...
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 