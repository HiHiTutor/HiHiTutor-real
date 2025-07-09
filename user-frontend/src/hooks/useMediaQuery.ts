import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const media = window.matchMedia(query);
    
    // 設置初始值
    setMatches(media.matches);

    // 創建事件監聽器
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 添加事件監聽器
    media.addEventListener('change', listener);

    // 清理函數
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  // 在 SSR 期間返回 false，避免 hydration mismatch
  if (!mounted) {
    return false;
  }

  return matches;
}

// 預定義的斷點 hooks
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 700px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 701px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
} 