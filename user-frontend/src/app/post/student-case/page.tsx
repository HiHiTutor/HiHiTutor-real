'use client';

import { useState } from 'react';
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
import { CATEGORY_OPTIONS } from '@/constants/categoryOptions';
import { REGION_OPTIONS } from '@/constants/regionOptions';

const formSchema = z.object({
  title: z.string().min(1, '請輸入標題'),
  description: z.string().min(1, '請輸入描述'),
  category: z.string().min(1, '請選擇分類'),
  subCategory: z.string().optional(),
  subjects: z.array(z.string()).min(1, '請選擇科目'),
  modes: z.array(z.string()).min(1, '請選擇教學模式'),
  regions: z.array(z.string()).optional(),
  subRegions: z.array(z.string()).optional(),
  price: z.string().min(1, '請輸入價格'),
  lessonDuration: z.string().min(1, '請輸入課程時長'),
  durationUnit: z.string().min(1, '請選擇時長單位'),
  weeklyLessons: z.string().min(1, '請輸入每週課程數'),
  startDate: z.date().optional()
});

type FormData = z.infer<typeof formSchema>;

export default function PostStudentCase() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const watchModes = watch('modes');

  const onSubmit = async (data: FormData) => {
    try {
      const caseData = {
        ...data,
        modes: selectedModes,
        regions: selectedRegions,
        subRegions: selectedSubRegions
      };
      await studentCaseApi.createStudentCase(caseData);
      toast.success('個案發布成功！');
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
    const newModes = selectedModes.includes(mode)
      ? selectedModes.filter(m => m !== mode)
      : [...selectedModes, mode];
    setSelectedModes(newModes);
    setValue('modes', newModes);
    
    // 如果取消選擇面授，清空地區選擇
    if (mode === 'in-person' && !newModes.includes('in-person')) {
      setSelectedRegions([]);
      setSelectedSubRegions([]);
      setValue('regions', []);
      setValue('subRegions', []);
    }
  };

  const handleRegionChange = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    setSelectedRegions(newRegions);
    setValue('regions', newRegions);
    setSelectedSubRegions([]);
    setValue('subRegions', []);
  };

  const handleSubRegionChange = (subRegion: string) => {
    const newSubRegions = selectedSubRegions.includes(subRegion)
      ? selectedSubRegions.filter(r => r !== subRegion)
      : [...selectedSubRegions, subRegion];
    setSelectedSubRegions(newSubRegions);
    setValue('subRegions', newSubRegions);
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
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                科目
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(selectedSubCategoryData?.subjects || selectedCategoryData?.subjects || []).map(subject => (
                  <div key={subject.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.value}
                      checked={watch('subjects').includes(subject.value)}
                      onCheckedChange={(checked) => {
                        const currentSubjects = watch('subjects') || [];
                        const newSubjects = checked
                          ? [...currentSubjects, subject.value]
                          : currentSubjects.filter(s => s !== subject.value);
                        setValue('subjects', newSubjects);
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教學模式
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online"
                    checked={selectedModes.includes('online')}
                    onCheckedChange={() => handleModeChange('online')}
                  />
                  <label
                    htmlFor="online"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Online
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-person"
                    checked={selectedModes.includes('in-person')}
                    onCheckedChange={() => handleModeChange('in-person')}
                  />
                  <label
                    htmlFor="in-person"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In-Person
                  </label>
                </div>
              </div>
              {errors.modes && (
                <p className="mt-1 text-sm text-red-600">{errors.modes.message as string}</p>
              )}
            </div>

            {selectedModes.includes('in-person') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地區
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {REGION_OPTIONS.map(region => (
                      <div key={region.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={region.value}
                          checked={selectedRegions.includes(region.value)}
                          onCheckedChange={() => handleRegionChange(region.value)}
                        />
                        <label
                          htmlFor={region.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {region.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRegions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分區
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRegions.map(regionValue => {
                        const region = REGION_OPTIONS.find(r => r.value === regionValue);
                        return region?.regions.map(subRegion => (
                          <div key={subRegion.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={subRegion.value}
                              checked={selectedSubRegions.includes(subRegion.value)}
                              onCheckedChange={() => handleSubRegionChange(subRegion.value)}
                            />
                            <label
                              htmlFor={subRegion.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subRegion.label}
                            </label>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每堂時長
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  {...register('lessonDuration', { required: '請輸入課程時長' })}
                  className="w-20"
                />
                <Select onValueChange={(value) => setValue('durationUnit', value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="單位" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">分鐘</SelectItem>
                    <SelectItem value="hours">小時</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.lessonDuration && (
                <p className="mt-1 text-sm text-red-600">{errors.lessonDuration.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每週堂數
              </label>
              <Input
                type="number"
                {...register('weeklyLessons', { required: '請輸入每週課程數' })}
                className="w-full"
                placeholder="請輸入每週課程數"
              />
              {errors.weeklyLessons && (
                <p className="mt-1 text-sm text-red-600">{errors.weeklyLessons.message as string}</p>
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
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('startDate')}
                    onSelect={(date) => setValue('startDate', date)}
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
                {...register('description', { required: '請輸入描述' })}
                className="w-full"
                placeholder="請描述您的需求（選填）"
                rows={4}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
              )}
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