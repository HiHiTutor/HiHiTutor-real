'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvatarEditor from '@/components/AvatarEditor';
import { tutorApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function AvatarEditorPage() {
  const router = useRouter();
  const [currentOffsetX, setCurrentOffsetX] = useState(50);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // 獲取導師資料
  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        const profile = await tutorApi.getProfile();
        setCurrentAvatarUrl(profile.avatar || '');
        
        // 如果有保存的偏移值，使用它
        if (profile.avatarOffsetX !== undefined) {
          setCurrentOffsetX(profile.avatarOffsetX);
        }
      } catch (error) {
        console.error('獲取導師資料失敗:', error);
        toast.error('獲取導師資料失敗');
        router.push('/tutor/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, [router]);

  const handleSave = async (offsetX: number) => {
    try {
      // 調用 API 更新導師的 avatarOffsetX
      await tutorApi.updateProfile({ avatarOffsetX: offsetX });
      setCurrentOffsetX(offsetX);
      toast.success('頭像位置已更新');
    } catch (error) {
      console.error('保存頭像位置失敗:', error);
      toast.error('保存失敗，請稍後再試');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">載入中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAvatarUrl) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">頭像位置編輯器</h1>
            <p className="text-gray-600 mb-4">請先上傳頭像後再使用此功能</p>
            <button
              onClick={() => router.push('/tutor/dashboard')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              返回儀表板
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">頭像位置編輯器</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 編輯器 */}
          <div>
            <AvatarEditor
              currentAvatarUrl={currentAvatarUrl}
              currentOffsetX={currentOffsetX}
              onSave={handleSave}
              tutorId="demo-tutor-id"
            />
          </div>

          {/* 預覽效果 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">預覽效果</h2>
            
            {/* 大頭像預覽 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">大頭像 (100px)</h3>
              <div
                className="w-[100px] h-[100px] rounded-full overflow-hidden bg-center bg-cover border-2 border-gray-300"
                style={{
                  backgroundImage: `url(${currentAvatarUrl})`,
                  backgroundPositionX: `${currentOffsetX}%`,
                }}
              />
            </div>

            {/* 小頭像預覽 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">小頭像 (50px)</h3>
              <div
                className="w-[50px] h-[50px] rounded-full overflow-hidden bg-center bg-cover border-2 border-gray-300"
                style={{
                  backgroundImage: `url(${currentAvatarUrl})`,
                  backgroundPositionX: `${currentOffsetX}%`,
                }}
              />
            </div>

            {/* 當前設定 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">當前設定</h3>
              <div className="space-y-2 text-sm">
                <p><strong>頭像 URL:</strong> {currentAvatarUrl}</p>
                <p><strong>水平偏移:</strong> {currentOffsetX}%</p>
                <p><strong>CSS 樣式:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`backgroundImage: url(${currentAvatarUrl})
backgroundPositionX: ${currentOffsetX}%`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 