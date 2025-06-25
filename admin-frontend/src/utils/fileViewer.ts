import api from '../services/api';

/**
 * 透過簽名URL API查看文件
 * @param fileUrl 完整的S3文件URL
 * @param fileName 可選的文件名，用於錯誤提示
 */
export const viewFileWithSignedUrl = async (fileUrl: string, fileName?: string) => {
  try {
    // 從完整URL中提取相對路徑
    // 例如: https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1000006/xxx.jpg
    // 提取: uploads/user-docs/1000006/xxx.jpg
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes('s3.ap-southeast-2.amazonaws.com'));
    
    if (bucketIndex === -1) {
      throw new Error('無法解析S3文件路徑');
    }
    
    // 提取bucket後的路徑部分
    const relativePath = urlParts.slice(bucketIndex + 1).join('/');
    
    console.log('🔍 文件查看請求:', {
      originalUrl: fileUrl,
      relativePath: relativePath,
      fileName: fileName
    });
    
    // 調用簽名URL API
    const response = await api.get(`/files/${encodeURIComponent(relativePath)}/signed-url`);
    
    if (response.data && response.data.url) {
      console.log('✅ 獲取簽名URL成功:', response.data.url);
      
      // 使用簽名URL打開文件
      window.open(response.data.url, '_blank');
    } else {
      throw new Error('API回應格式錯誤');
    }
    
  } catch (error: any) {
    console.error('❌ 文件查看失敗:', error);
    
    let errorMessage = '無法開啟文件';
    if (error.response?.status === 404) {
      errorMessage = '文件不存在';
    } else if (error.response?.status === 401) {
      errorMessage = '登入已過期，請重新登入';
    } else if (error.response?.status === 403) {
      errorMessage = '權限不足';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // 顯示錯誤提示
    alert(`${errorMessage}${fileName ? `: ${fileName}` : ''}`);
  }
};

/**
 * 批量查看文件（用於多文件列表）
 * @param fileUrls 文件URL數組
 * @param fileNames 對應的文件名數組（可選）
 */
export const viewMultipleFiles = async (fileUrls: string[], fileNames?: string[]) => {
  for (let i = 0; i < fileUrls.length; i++) {
    const fileName = fileNames?.[i];
    await viewFileWithSignedUrl(fileUrls[i], fileName);
    
    // 如果有多個文件，稍微延遲一下避免API限制
    if (i < fileUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}; 