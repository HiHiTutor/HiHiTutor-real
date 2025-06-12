'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Tutor {
  tutorId: string;
  name: string;
  avatar: string;
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  rating: number;
  introduction: string;
  education: string;
  qualifications: string[];
  hourlyRate: number;
  availableTime: string[];
}

export default function TutorDetailPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tutors/detail/${tutorId}`);
        if (!response.ok) throw new Error('獲取導師詳情失敗');
        
        const data = await response.json();
        setTutor(data);
      } catch (error) {
        console.error('Error fetching tutor detail:', error);
        toast.error('獲取導師詳情失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetail();
  }, [tutorId]);

  if (loading) {
    return <div className="container mx-auto py-8 text-center">載入中...</div>;
  }

  if (!tutor) {
    return <div className="container mx-auto py-8 text-center">找不到該導師</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左側：基本資料 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={tutor.avatar} alt={tutor.name} />
                  <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{tutor.name}</h1>
                  <div className="text-muted-foreground mb-4">
                    教學經驗 {tutor.experience} 年 | 評分 {tutor.rating} / 5.0
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">簡介</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {tutor.introduction}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">學歷</h2>
              <p className="text-muted-foreground">{tutor.education}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">專業資格</h2>
              <ul className="list-disc list-inside text-muted-foreground">
                {tutor.qualifications.map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 右側：聯絡資訊 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">教學資訊</h2>
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-2">教學地區</div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.teachingAreas.map((area) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">授課方式</div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.teachingMethods.map((method) => (
                      <Badge key={method} variant="outline">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">時薪</div>
                  <p className="text-muted-foreground">HK$ {tutor.hourlyRate} / 小時</p>
                </div>
                <div>
                  <div className="font-medium mb-2">可授課時間</div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.availableTime.map((time) => (
                      <Badge key={time} variant="outline">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">聯絡導師</h2>
              <div className="space-y-4">
                <Button className="w-full">發送訊息</Button>
                <Button variant="outline" className="w-full">
                  預約試堂
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 