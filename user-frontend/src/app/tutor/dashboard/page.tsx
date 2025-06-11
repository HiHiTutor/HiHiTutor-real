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

const formSchema = z.object({
  avatar: z.string().optional(),
  nickname: z.string().min(1, '請輸入稱呼'),
  gender: z.enum(['male', 'female'], { required_error: '請選擇性別' }),
  phone: z.string().min(8, '請輸入有效的聯絡電話'),
  birthDate: z.date({ required_error: '請選擇出生日期' }),
  education: z.string().min(1, '請輸入學歷'),
  teachingExperience: z.coerce.number().min(0, '請輸入授課年資'),
  subjects: z.array(z.string()).min(1, '請選擇教授科目'),
  examResults: z.string().min(1, '請輸入相關科目公開試成績'),
  teachingAreas: z.array(z.string()).min(1, '請選擇上堂地區'),
  teachingSchedule: z.string().min(1, '請輸入上堂時間'),
  teachingModes: z.array(z.string()).min(1, '請選擇上堂形式'),
  hourlyRate: z.coerce.number().min(1, '請輸入要求堂費'),
  introduction: z.string().min(1, '請輸入個人簡介'),
  courseFeatures: z.string().min(1, '請輸入課程特點'),
  idCard: z.string().optional(),
  certificates: z.string().optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teachingModes: [],
      subjects: [],
      teachingAreas: [],
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
                    <FormLabel>聯絡電話</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入聯絡電話" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>出生日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>請選擇出生日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>要求堂費（每小時）</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="請輸入要求堂費" {...field} />
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

              <FormField
                control={form.control}
                name="courseFeatures"
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

              <div className="space-y-4">
                <div>
                  <FormLabel>身份證</FormLabel>
                  <div className="mt-2">
                    <Button variant="outline" type="button">
                      上傳身份證
                    </Button>
                  </div>
                </div>

                <div>
                  <FormLabel>學歷證書</FormLabel>
                  <div className="mt-2">
                    <Button variant="outline" type="button">
                      上傳學歷證書
                    </Button>
                  </div>
                </div>
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