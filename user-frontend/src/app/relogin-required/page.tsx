'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw } from 'lucide-react';

export default function ReloginRequiredPage() {
  const router = useRouter();

  useEffect(() => {
    // 清除所有本地存儲的認證信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 清除所有可能的緩存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }, []);

  const handleLogin = () => {
    // 跳轉到登入頁面，並帶上重定向參數
    router.push('/login?redirect=/tutor/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            資料更新成功
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              您的導師資料已成功更新並保存到系統中。
            </p>
            <p className="text-gray-700 font-medium">
              請重新登入查看最新導師資料
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新登入
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              返回首頁
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>重新登入後，您將自動跳轉到導師儀表板</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
