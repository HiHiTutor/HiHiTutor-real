'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import toast from 'react-hot-toast';

interface AvatarEditorProps {
  currentAvatarUrl: string;
  currentOffsetX?: number;
  onSave: (offsetX: number) => Promise<void>;
  tutorId: string;
}

const AvatarEditor = ({ 
  currentAvatarUrl, 
  currentOffsetX = 50, 
  onSave, 
  tutorId 
}: AvatarEditorProps) => {
  const [offsetX, setOffsetX] = useState(currentOffsetX);
  const [isSaving, setIsSaving] = useState(false);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(currentAvatarUrl);

  // 當外部 avatarUrl 改變時更新預覽
  useEffect(() => {
    setPreviewAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(offsetX);
      toast.success('頭像位置已更新');
    } catch (error) {
      console.error('保存頭像位置失敗:', error);
      toast.error('保存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setOffsetX(50);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">調整頭像位置</CardTitle>
        <p className="text-sm text-gray-600">
          左右拖動滑塊來調整頭像的顯示位置
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 預覽區域 */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full overflow-hidden bg-center bg-cover border-2 border-gray-200"
              style={{
                backgroundImage: `url(${previewAvatarUrl})`,
                backgroundPositionX: `${offsetX}%`,
              }}
            />
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-50 pointer-events-none" />
          </div>
        </div>

        {/* 滑塊控制 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">水平位置</span>
            <span className="text-sm text-gray-500">{offsetX}%</span>
          </div>
          
          <Slider
            value={[offsetX]}
            onValueChange={(value: number[]) => setOffsetX(value[0])}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>左側</span>
            <span>置中</span>
            <span>右側</span>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            重置
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || offsetX === currentOffsetX}
            className="flex-1"
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>

        {/* 說明文字 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 50% = 頭像置中顯示</p>
          <p>• 0% = 顯示頭像左側</p>
          <p>• 100% = 顯示頭像右側</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarEditor; 