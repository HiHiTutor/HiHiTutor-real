export function formatDate(dateString: string): string {
  if (!dateString) return '未知時間';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '無效日期';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} 分鐘前`;
    }
    return `${hours} 小時前`;
  }

  if (days < 7) {
    return `${days} 天前`;
  }

  return date.toLocaleDateString('zh-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 