'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import SUBJECT_MAP from '@/constants/subjectOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import { Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

type Subject = {
  value: string;
  label: string;
};

type District = {
  value: string;
  label: string;
};

type RegionOption = {
  value: string;
  label: string;
  regions: District[];
};

type FormValues = z.infer<typeof formSchema>;

type SubjectMap = {
  [key: string]: Subject[]
}

type RegionMap = {
  [key: string]: RegionOption
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)

// 獲取指定年月的天數
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}

// 檢查是否為閏年
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

const formSchema = z.object({
  nickname: z.string().min(2, '暱稱至少需要2個字符'),
  gender: z.string().min(1, '請選擇性別'),
  birthDay: z.string().min(1, '請選擇出生日期'),
  introduction: z.string().min(10, '個人簡介至少需要10個字符'),
  education: z.string().min(1, '請選擇學歷'),
  teachingYears: z.string().min(1, '請選擇授課年資'),
  subjects: z.array(z.string()).min(1, '請選擇至少一個教授科目'),
  examResults: z.string().min(1, '請選擇公開試成績'),
  teachingAreas: z.array(z.string()).min(1, '請選擇至少一個教學區域'),
  teachingMethods: z.array(z.string()).min(1, '請選擇至少一個授課方式'),
  hourlyRate: z.string().min(1, '請輸入每堂收費'),
  teachingStyle: z.string().min(10, '課程特點至少需要10個字符'),
  teachingSchedule: z.object({
    weekdays: z.array(z.string()),
    weekends: z.array(z.string()),
    timeSlots: z.array(z.string()),
  }),
});

const teachingModes = [
  { value: 'in-person', label: '面授' },
  { value: 'online', label: '網課' },
] as const;

const subjects = Object.entries(SUBJECT_MAP).map(([value, label]) => ({
  value,
  label,
}));

const regions = REGION_OPTIONS;

export default function TutorProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("")
  const [idCardImage, setIdCardImage] = useState<string>("")
  const [certificateImages, setCertificateImages] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdCardImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setCertificateImages(prev => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeCertificate = (index: number) => {
    setCertificateImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    form.setValue("birthDay", "")
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    form.setValue("birthDay", "")
  }

  const getAvailableDays = () => {
    if (!selectedYear || !selectedMonth) return Array.from({ length: 31 }, (_, i) => i + 1)
    
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    const daysInMonth = getDaysInMonth(year, month)
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      gender: 'male',
      birthDay: '',
      introduction: '',
      education: '',
      teachingYears: '',
      subjects: [],
      examResults: '',
      teachingAreas: [],
      teachingMethods: [],
      hourlyRate: '',
      teachingStyle: '',
      teachingSchedule: {
        weekdays: [],
        weekends: [],
        timeSlots: [],
      },
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      // TODO: 實現導師資料提交邏輯
      toast.success('成功更新導師資料！');
      router.push('/tutor/dashboard');
    } catch (error) {
      console.error('更新導師資料失敗:', error);
      toast.error('更新導師資料失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>導師資料</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* 個人資料 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">個人資料</h2>
                
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback>頭像</AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">上傳個人照片</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>暱稱</FormLabel>
                        <FormControl>
                          <Input placeholder="請輸入暱稱" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性別</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="請選擇性別" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">男</SelectItem>
                            <SelectItem value="female">女</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>出生日期</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), "PPP") : "選擇日期"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => date && field.onChange(date.toISOString())}
                              disabled={(date) => {
                                const today = new Date();
                                return date > today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="introduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>個人簡介</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="請輸入個人簡介"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>身份證</FormLabel>
                  <div className="flex items-center space-x-4">
                    {idCardImage && (
                      <img src={idCardImage} alt="身份證" className="h-32 w-auto" />
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIdCardChange}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500">上傳身份證</p>
                    </div>
                  </div>
                  <FormMessage />
                </div>
              </div>

              {/* 教學資訊 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">教學資訊</h2>

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>學歷</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇學歷" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high-school">中學</SelectItem>
                          <SelectItem value="associate">副學士</SelectItem>
                          <SelectItem value="bachelor">學士</SelectItem>
                          <SelectItem value="master">碩士</SelectItem>
                          <SelectItem value="phd">博士</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>學歷證書</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {certificateImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`證書 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                      <div className="flex flex-col items-center">
                        <Plus className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">上傳證書</span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleCertificateChange}
                      />
                    </label>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="teachingYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>授課年資</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇授課年資" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-1">1年以下</SelectItem>
                          <SelectItem value="1-3">1-3年</SelectItem>
                          <SelectItem value="3-5">3-5年</SelectItem>
                          <SelectItem value="5-10">5-10年</SelectItem>
                          <SelectItem value="10+">10年以上</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教授科目</FormLabel>
                      <div className="space-y-4">
                        {Object.entries(SUBJECT_MAP).map(([category, subjectName]) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={field.value.includes(category)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, category]
                                  : field.value.filter((v) => v !== category)
                                field.onChange(newValue)
                              }}
                            />
                            <label
                              htmlFor={category}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subjectName}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examResults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>公開試成績</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入公開試成績" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teachingAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教學區域</FormLabel>
                      <div className="space-y-4">
                        {REGION_OPTIONS.map((region) => (
                          <div key={region.value} className="space-y-2">
                            <h4 className="font-medium">{region.label}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {region.regions.map((district) => (
                                <div key={district.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={district.value}
                                    checked={field.value.includes(district.value)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, district.value]
                                        : field.value.filter((v) => v !== district.value)
                                      field.onChange(newValue)
                                    }}
                                  />
                                  <label
                                    htmlFor={district.value}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {district.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teachingMethods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>授課方式</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange([...field.value, value])}
                          value={field.value[field.value.length - 1]}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="請選擇授課方式" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachingModes.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((mode) => (
                          <div
                            key={mode}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            {mode}
                            <button
                              type="button"
                              className="ml-2 text-xs"
                              onClick={() =>
                                field.onChange(field.value.filter((m) => m !== mode))
                              }
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>每堂收費</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="請輸入每堂收費"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/^0+/, '') || '0'
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teachingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>課程特點</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="請輸入課程特點"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teachingSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>可授課時間</FormLabel>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">平日</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['星期一', '星期二', '星期三', '星期四', '星期五'].map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`weekday-${day}`}
                                  checked={field.value.weekdays.includes(day)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value.weekdays, day]
                                      : field.value.weekdays.filter((d) => d !== day)
                                    field.onChange({ ...field.value, weekdays: newValue })
                                  }}
                                />
                                <label
                                  htmlFor={`weekday-${day}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">假日</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['星期六', '星期日'].map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`weekend-${day}`}
                                  checked={field.value.weekends.includes(day)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value.weekends, day]
                                      : field.value.weekends.filter((d) => d !== day)
                                    field.onChange({ ...field.value, weekends: newValue })
                                  }}
                                />
                                <label
                                  htmlFor={`weekend-${day}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">時段</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              '上午 (9:00-12:00)',
                              '下午 (13:00-17:00)',
                              '晚上 (18:00-21:00)',
                            ].map((slot) => (
                              <div key={slot} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`slot-${slot}`}
                                  checked={field.value.timeSlots.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value.timeSlots, slot]
                                      : field.value.timeSlots.filter((s) => s !== slot)
                                    field.onChange({ ...field.value, timeSlots: newValue })
                                  }}
                                />
                                <label
                                  htmlFor={`slot-${slot}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {slot}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  取消
                </Button>
                <Button type="submit">儲存更改</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 