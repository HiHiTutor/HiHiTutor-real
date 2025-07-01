'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { getSubjectName } from '@/utils/translate';

interface Tutor {
  id: string;
  userId: string;
  tutorId: string | null;
  name: string;
  avatar: string;
  avatarOffsetX: number;
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
  examResults: string[];
  courseFeatures: string;
}

export default function TutorDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || useParams().tutorId;
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorDetail = async () => {
      try {
        setLoading(true);
        console.log('🔍 開始獲取導師詳情:', tutorId);
        
        const response = await fetch(`/api/tutors/${tutorId}`);
        console.log('📊 API 響應狀態:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API 錯誤:', errorText);
          throw new Error('獲取導師詳情失敗');
        }
        
        const result = await response.json();
        console.log('📥 API 響應數據:', result);
        
        if (result.success && result.data) {
          console.log('✅ 設置導師數據:', result.data);
          setTutor(result.data);
        } else {
          console.error('❌ API 響應格式錯誤:', result);
          throw new Error(result.message || '獲取導師詳情失敗');
        }
      } catch (error) {
        console.error('❌ 獲取導師詳情錯誤:', error);
        toast.error('獲取導師詳情失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetail();
  }, [tutorId]);

  if (tutor) {
    // fallback: 保證所有陣列型欄位不為 undefined
    tutor.subjects = tutor.subjects || [];
    tutor.teachingAreas = tutor.teachingAreas || [];
    tutor.teachingMethods = tutor.teachingMethods || [];
    tutor.qualifications = tutor.qualifications || [];
    tutor.availableTime = tutor.availableTime || [];
    tutor.examResults = tutor.examResults || [];
  }

  if (loading) {
    return <div className="container mx-auto py-8 text-center max-sm:py-6 max-sm:px-4 max-[700px]:py-6 max-[700px]:px-6">載入中...</div>;
  }

  if (!tutor) {
    return <div className="container mx-auto py-8 text-center max-sm:py-6 max-sm:px-4 max-[700px]:py-6 max-[700px]:px-6">找不到該導師</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 max-sm:py-6 max-sm:px-4 max-[700px]:py-6 max-[700px]:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-sm:gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-6">
        {/* 左側：基本資料 */}
        <div className="md:col-span-2 space-y-6 max-sm:space-y-4 max-[700px]:space-y-5">
          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <div className="flex items-start gap-6 max-sm:flex-col max-sm:items-center max-sm:gap-4 max-sm:text-center max-[700px]:flex-col max-[700px]:items-center max-[700px]:gap-4 max-[700px]:text-center">
                <Avatar className="h-24 w-24 max-sm:h-20 max-sm:w-20 max-[700px]:h-22 max-[700px]:w-22">
                  <AvatarImage src={tutor.avatar} alt={tutor.name} />
                  <AvatarFallback className="max-sm:text-lg max-[700px]:text-lg">{tutor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 max-sm:w-full max-[700px]:w-full">
                  <h1 className="text-2xl font-bold mb-2 max-sm:text-xl max-sm:mb-1 max-[700px]:text-xl max-[700px]:mb-2">{tutor.name}</h1>
                  <div className="text-muted-foreground mb-4 max-sm:text-sm max-sm:mb-3 max-[700px]:text-sm max-[700px]:mb-3">
                    教學經驗 {tutor.experience} 年 | 評分 {tutor.rating} / 5.0
                  </div>
                  <div className="flex flex-wrap gap-2 max-sm:gap-1 max-sm:justify-center max-[700px]:gap-2 max-[700px]:justify-center">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="max-sm:text-xs max-[700px]:text-xs">
                        {getSubjectName(subject)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">簡介</h2>
              <p className="text-muted-foreground whitespace-pre-line max-sm:text-sm max-[700px]:text-sm">
                {tutor.introduction}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">學歷</h2>
              <p className="text-muted-foreground max-sm:text-sm max-[700px]:text-sm">{tutor.education}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">專業資格</h2>
              <ul className="list-disc list-inside text-muted-foreground max-sm:text-sm max-[700px]:text-sm">
                {tutor.qualifications.map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 右側：聯絡資訊 */}
        <div className="space-y-6 max-sm:space-y-4 max-[700px]:space-y-5">
          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">教學資訊</h2>
              <div className="space-y-4 max-sm:space-y-3 max-[700px]:space-y-4">
                <div>
                  <div className="font-medium mb-2 max-sm:text-sm max-sm:mb-1 max-[700px]:text-sm max-[700px]:mb-2">教學地區</div>
                  <div className="flex flex-wrap gap-2 max-sm:gap-1 max-[700px]:gap-2">
                    {tutor.teachingAreas.map((area) => (
                      <Badge key={area} variant="outline" className="max-sm:text-xs max-[700px]:text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2 max-sm:text-sm max-sm:mb-1 max-[700px]:text-sm max-[700px]:mb-2">授課方式</div>
                  <div className="flex flex-wrap gap-2 max-sm:gap-1 max-[700px]:gap-2">
                    {tutor.teachingMethods.map((method) => (
                      <Badge key={method} variant="outline" className="max-sm:text-xs max-[700px]:text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2 max-sm:text-sm max-sm:mb-1 max-[700px]:text-sm max-[700px]:mb-2">時薪</div>
                  <p className="text-muted-foreground max-sm:text-sm max-[700px]:text-sm">HK$ {tutor.hourlyRate} / 小時</p>
                </div>
                <div>
                  <div className="font-medium mb-2 max-sm:text-sm max-sm:mb-1 max-[700px]:text-sm max-[700px]:mb-2">可授課時間</div>
                  <div className="flex flex-wrap gap-2 max-sm:gap-1 max-[700px]:gap-2">
                    {tutor.availableTime.map((time) => (
                      <Badge key={time} variant="outline" className="max-sm:text-xs max-[700px]:text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">聯絡導師</h2>
              <div className="space-y-4 max-sm:space-y-3 max-[700px]:space-y-4">
                {/* WhatsApp 黃底按鈕 */}
                {id && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=85284158743&text=${encodeURIComponent(`Hello，我喺 HiHiTutor 見到 tutorID ${id}，想了解同預約上堂，請問方便嗎？`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      background: '#FFD600',
                      color: '#222',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      padding: '16px 32px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      marginTop: '4px',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    🎯 立即預約上堂
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 