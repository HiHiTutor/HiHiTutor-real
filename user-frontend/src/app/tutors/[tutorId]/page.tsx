'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { getSubjectName } from '@/utils/translate';
import { useUser } from '@/hooks/useUser';
import { 
  getTeachingModeDisplay, 
  getRegionDisplay, 
  getCategoryDisplay, 
  getSubCategoryDisplay,
  formatTeachingSubModes,
  formatRegions
} from '@/utils/tutorProfileUtils';
import { calculateAge, formatAge } from '@/utils/ageUtils';
import Dialog from '@/components/Dialog';

export default function TutorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const tutorId = typeof params?.tutorId === 'string' ? params.tutorId : '';
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

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

  // 等待用戶資料載入完成
  if (userLoading || loading) {
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
                  <AvatarImage 
                    src={tutor.avatar || 'https://hi-hi-tutor-real-backend2.vercel.app/avatars/default.png'} 
                    alt={tutor.tutorId || ''} 
                  />
                  <AvatarFallback className="max-sm:text-lg max-[700px]:text-lg">{tutor.tutorId?.[0] || 'T'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 max-sm:w-full max-[700px]:w-full">
                  <h1 className="text-2xl font-bold mb-2 max-sm:text-xl max-sm:mb-1 max-[700px]:text-xl max-[700px]:mb-2">{tutor.tutorId}</h1>
                  <div className="text-muted-foreground mb-4 max-sm:text-sm max-sm:mb-3 max-[700px]:text-sm max-[700px]:mb-3">
                    年齡 {formatAge(calculateAge(tutor.birthDate))} | 教學經驗 {tutor.experience} 年 | 評分 {Number(tutor.rating).toFixed(1)} / 5.0
                  </div>
                  <div className="flex flex-wrap gap-2 max-sm:gap-1 max-sm:justify-center max-[700px]:gap-2 max-[700px]:justify-center">
                    {(tutor.subjects || []).map((subject: string) => (
                      <Badge key={subject} variant="secondary" className="max-sm:text-xs max-[700px]:text-xs">
                        {getSubjectName(subject)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 教學資訊 */}
          <Card>
            <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
              <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">教學資訊</h2>
              <div className="space-y-3 max-sm:space-y-2 max-[700px]:space-y-2">
                {tutor.teachingMethods && tutor.teachingMethods.length > 0 ? (
                  <div className="flex items-start">
                    <span className="font-medium text-sm w-24 flex-shrink-0 max-sm:w-20 max-[700px]:w-20">教學方式：</span>
                    <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                      {formatTeachingSubModes(tutor.teachingMethods)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <span className="font-medium text-sm w-24 flex-shrink-0 max-sm:w-20 max-[700px]:w-20">教學方式：</span>
                    <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                      暫未設定
                    </span>
                  </div>
                )}
                
                {tutor.hourlyRate ? (
                  <div className="flex items-start">
                    <span className="font-medium text-sm w-24 flex-shrink-0 max-sm:w-20 max-[700px]:w-20">每小時堂費：</span>
                    <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                      ${tutor.hourlyRate}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <span className="font-medium text-sm w-24 flex-shrink-0 max-sm:w-20 max-[700px]:w-20">每小時堂費：</span>
                    <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                      暫未設定
                    </span>
                  </div>
                )}
                
                {/* 教授地區 - 簡化條件判斷 */}
                <div className="flex items-start">
                  <span className="font-medium text-sm w-24 flex-shrink-0 max-sm:w-20 max-[700px]:w-20">教授地區：</span>
                  <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                    {tutor.teachingAreas && tutor.teachingAreas.length > 0 ? (
                      formatRegions(tutor.teachingAreas)
                    ) : (
                      '暫未設定'
                    )}
                  </span>
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
                {(tutor.qualifications || []).map((qualification: string, index: number) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 課程特點 */}
          {tutor.courseFeatures && (
            <Card>
              <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
                <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">課程特點</h2>
                <p className="text-muted-foreground whitespace-pre-line max-sm:text-sm max-[700px]:text-sm">
                  {tutor.courseFeatures}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 公開證書 */}
          {tutor.publicCertificates && tutor.publicCertificates.length > 0 && (
            <Card>
              <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
                <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">公開證書</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.publicCertificates.map((cert: string, index: number) => (
                    <div key={index} className="relative w-full h-48 border rounded-lg overflow-hidden">
                                              <img
                        src={cert}
                        alt={`公開證書 ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 課程分類 */}
          {(tutor.tutorProfile?.category || tutor.tutorProfile?.subCategory) && (
            <Card>
              <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
                <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">課程分類</h2>
                <div className="space-y-3 max-sm:space-y-2 max-[700px]:space-y-2">
                  {tutor.tutorProfile?.category && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">課程分類：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {getCategoryDisplay(tutor.tutorProfile.category)}
                      </span>
                    </div>
                  )}
                  
                  {tutor.tutorProfile?.subCategory && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">子分類：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {getSubCategoryDisplay(tutor.tutorProfile.subCategory)}
                      </span>
                    </div>
                  )}
                  
                  {tutor.tutorProfile?.subjects && tutor.tutorProfile.subjects.length > 0 && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">可教科目：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {tutor.tutorProfile.subjects.map((subject: string) => getSubjectName(subject)).join('、')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 導師申請資料 */}
          {tutor.tutorApplication && (
            <Card>
              <CardContent className="pt-6 max-sm:pt-4 max-[700px]:pt-5">
                <h2 className="text-xl font-semibold mb-4 max-sm:text-lg max-sm:mb-3 max-[700px]:text-lg max-[700px]:mb-3">申請資料</h2>
                <div className="space-y-3 max-sm:space-y-2 max-[700px]:space-y-2">
                  {tutor.tutorApplication.education && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">學歷：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {tutor.tutorApplication.education}
                      </span>
                    </div>
                  )}
                  
                  {tutor.tutorApplication.experience && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">教學經驗：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {tutor.tutorApplication.experience} 年
                      </span>
                    </div>
                  )}
                  
                  {tutor.tutorApplication.subjects && tutor.tutorApplication.subjects.length > 0 && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">專長科目：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {tutor.tutorApplication.subjects.join('、')}
                      </span>
                    </div>
                  )}
                  
                  {tutor.tutorApplication.documents && tutor.tutorApplication.documents.length > 0 && (
                    <div className="flex items-start">
                      <span className="font-medium text-sm w-20 flex-shrink-0 max-sm:w-16 max-[700px]:w-16">證書數量：</span>
                      <span className="text-muted-foreground text-sm max-sm:text-xs max-[700px]:text-xs">
                        {tutor.tutorApplication.documents.length} 張
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 導師卡片結束後，插入靠左的 WhatsApp 按鈕 */}
        <div className="w-full flex justify-center md:justify-start mt-6">
          {tutorId && (
            <>
              <Button 
                onClick={() => {
                  if (!user) {
                    // 未登入：顯示訊息並跳轉到登入頁面
                    setShowLoginMessage(true);
                    setTimeout(() => {
                      router.push('/login');
                    }, 3000);
                    return;
                  }
                  // 已登入：直接跳轉到 WhatsApp
                  const tutorUrl = `https://www.hihitutor.com/tutors/${tutorId}`;
                  const message = `Hello，我喺 HiHiTutor 見到 tutorID ${tutorId}，想了解同預約上堂，請問方便嗎？\n\n導師詳情：${tutorUrl}`;
                  const whatsappUrl = `https://api.whatsapp.com/send?phone=85295011159&text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                }}
                className="bg-yellow-400 text-black hover:bg-yellow-500 px-6 py-3 text-base md:text-lg"
              >
                🎯 立即預約上堂
              </Button>
              {/* 置中大字彈窗 */}
              <Dialog
                isOpen={showLoginMessage}
                onClose={() => setShowLoginMessage(false)}
                title=""
                message={
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 8 }}>請先登入</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>3秒後自動跳轉到登入頁面...</div>
                  </div>
                }
                actions={[]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 