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

type FormValues = z.infer<typeof formSchema>;

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)

const formSchema = z.object({
  avatar: z.string().optional(),
  nickname: z.string().min(1, '請輸入暱稱'),
  gender: z.enum(['male', 'female'], { required_error: '請選擇性別' }),
  phone: z.string().min(8, '請輸入有效的聯絡電話'),
  birthYear: z.string().min(1, "請選擇出生年份"),
  birthMonth: z.string().min(1, "請選擇出生月份"),
  birthDay: z.string().min(1, "請選擇出生日期"),
  education: z.string().min(1, '請輸入學歷'),
  teachingExperience: z.coerce.number().min(0, '請輸入授課年資'),
  subjects: z.array(z.string()).min(1, '請選擇至少一個科目'),
  examResults: z.string().min(1, '請輸入公開試成績'),
  teachingAreas: z.array(z.string()).min(1, '請選擇至少一個教學區域'),
  teachingSchedule: z.string().min(1, '請輸入可授課時間'),
  teachingModes: z.array(z.string()).min(1, '請選擇至少一種授課方式'),
  teachingPrice: z.coerce.number().min(0, '請輸入每小時收費'),
  idCard: z.string().min(1, '請上傳身份證'),
  certifications: z.array(z.string()).min(1, '請上傳至少一份證書'),
  introduction: z.string().min(1, '請輸入自我介紹'),
  teachingStyle: z.string().min(1, '請輸入教學風格'),
  teachingPhilosophy: z.string().min(1, '請輸入教學理念'),
  teachingGoals: z.string().min(1, '請輸入教學目標'),
  workExperience: z.string().min(1, '請輸入工作經驗'),
  skills: z.string().min(1, '請輸入技能'),
  availableTime: z.string().min(1, '請輸入可授課時間'),
  teachingLevels: z.array(z.string()).min(1, '請選擇至少一個級別'),
  teachingLanguages: z.array(z.string()).min(1, '請選擇至少一種語言'),
  teachingLocations: z.array(z.string()).min(1, '請選擇至少一個地點'),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar: '',
      nickname: '',
      gender: 'male',
      phone: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      education: '',
      teachingExperience: 0,
      subjects: [],
      examResults: '',
      teachingAreas: [],
      teachingSchedule: '',
      teachingModes: [],
      teachingPrice: 0,
      idCard: '',
      certifications: [],
      introduction: '',
      teachingStyle: '',
      teachingPhilosophy: '',
      teachingGoals: '',
      workExperience: '',
      skills: '',
      availableTime: '',
      teachingLevels: [],
      teachingLanguages: [],
      teachingLocations: [],
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

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdCardImage(reader.result as string)
        form.setValue("idCard", reader.result as string)
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
            form.setValue("certifications", [...certificateImages, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeCertificate = (index: number) => {
    setCertificateImages(prev => prev.filter((_, i) => i !== index))
    form.setValue("certifications", certificateImages.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>導師資料</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={form.watch('avatar')} />
                  <AvatarFallback>頭像</AvatarFallback>
                </Avatar>
                <Button variant="outline" type="button">
                  上傳頭像
                </Button>
              </div>

              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>稱呼</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入稱呼" {...field} />
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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>出生年份</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇年份" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}年
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>出生月份</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇月份" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}月
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>出生日期</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇日期" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {days.map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}日
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>學歷</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入學歷" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teachingExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>授課年資</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="請輸入授課年資" {...field} />
                    </FormControl>
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
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇教授科目" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((subject) => (
                        <div
                          key={subject}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {subjects.find((s) => s.value === subject)?.label}
                          <button
                            type="button"
                            className="ml-2 text-xs"
                            onClick={() =>
                              field.onChange(field.value.filter((s) => s !== subject))
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
                name="examResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>相關科目公開試成績</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入相關科目公開試成績"
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
                name="teachingAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上堂地區</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇上堂地區" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((area) => (
                        <div
                          key={area}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {regions.find((r) => r.value === area)?.label}
                          <button
                            type="button"
                            className="ml-2 text-xs"
                            onClick={() =>
                              field.onChange(field.value.filter((a) => a !== area))
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
                name="teachingSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上堂時間</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入上堂時間（例如：週一至週五 18:00-21:00，週六日 10:00-18:00）"
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
                name="teachingModes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上堂形式</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇上堂形式" />
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((mode) => (
                        <div
                          key={mode}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {teachingModes.find((m) => m.value === mode)?.label}
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
                name="teachingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>每小時收費</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="請輸入每小時收費"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="introduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>自我介紹</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入自我介紹"
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
                name="teachingStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>教學風格</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入教學風格" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teachingPhilosophy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>教學理念</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入教學理念" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teachingGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>教學目標</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入教學目標" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>工作經驗</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入工作經驗"
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
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>技能</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入技能"
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
                name="availableTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>可授課時間</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入可授課時間"
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
                name="teachingLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>級別</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange([...field.value, value])}
                        value={field.value[field.value.length - 1]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇級別" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Add your level options here */}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((level) => (
                        <div
                          key={level}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {/* Add your level label here */}
                          <button
                            type="button"
                            className="ml-2 text-xs"
                            onClick={() =>
                              field.onChange(field.value.filter((l) => l !== level))
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
                name="teachingLanguages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>語言</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange([...field.value, value])}
                        value={field.value[field.value.length - 1]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇語言" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Add your language options here */}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((language) => (
                        <div
                          key={language}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {/* Add your language label here */}
                          <button
                            type="button"
                            className="ml-2 text-xs"
                            onClick={() =>
                              field.onChange(field.value.filter((l) => l !== language))
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
                name="teachingLocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地點</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange([...field.value, value])}
                        value={field.value[field.value.length - 1]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇地點" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Add your location options here */}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((location) => (
                        <div
                          key={location}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {/* Add your location label here */}
                          <button
                            type="button"
                            className="ml-2 text-xs"
                            onClick={() =>
                              field.onChange(field.value.filter((l) => l !== location))
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

              <div className="space-y-2">
                <FormLabel>學歷證書</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {certificateImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`證書 ${index + 1}`} className="h-32 w-auto" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => removeCertificate(index)}
                      >
                        刪除
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCertificateChange}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">上傳學歷證書（可多選）</p>
                </div>
                <FormMessage />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '提交'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 