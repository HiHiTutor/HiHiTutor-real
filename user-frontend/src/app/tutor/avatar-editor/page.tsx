'use client';

import { useState } from 'react';
import AvatarEditor from '@/components/AvatarEditor';

export default function AvatarEditorPage() {
  const [currentOffsetX, setCurrentOffsetX] = useState(50);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('/avatars/teacher1.png');

  const handleSave = async (offsetX: number) => {
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentOffsetX(offsetX);
    
    // 這裡應該調用實際的 API 來更新導師的 avatarOffsetX
    console.log('保存頭像偏移位置:', offsetX);
  };

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