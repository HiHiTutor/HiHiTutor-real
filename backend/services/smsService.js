const axios = require('axios');
const crypto = require('crypto');

class SMSService {
  constructor() {
    this.clientId = process.env.SMS_TO_CLIENT_ID;
    this.clientSecret = process.env.SMS_TO_CLIENT_SECRET;
    this.baseURL = 'https://api.sms.to/v1';
    this.authURL = 'https://auth.sms.to';
  }

  // 生成6位數驗證碼
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 獲取訪問令牌
  async getAccessToken() {
    try {
      console.log('🔐 獲取 SMS.to 訪問令牌...');
      console.log('🔐 使用認證 URL:', this.authURL);
      console.log('🔐 Client ID:', this.clientId ? '已設置' : '未設置');
      console.log('🔐 Client Secret:', this.clientSecret ? '已設置' : '未設置');
      
      // 使用 URLSearchParams 將 body 正確編碼
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);

      const response = await axios.post(`${this.authURL}/oauth/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      console.log('✅ 訪問令牌獲取成功');
      console.log('🔐 響應狀態:', response.status);
      return response.data.access_token;
    } catch (error) {
      console.error('❌ 獲取訪問令牌失敗:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${this.authURL}/oauth/token`
      });
      throw new Error('Failed to get access token');
    }
  }

  // 發送 SMS 驗證碼
  async sendVerificationSMS(phoneNumber, otp, senderId = null) {
    try {
      console.log('📱 開始發送 SMS 驗證碼...');
      
      // 檢查環境變數
      if (!this.clientId || !this.clientSecret) {
        throw new Error('SMS Client ID or Secret not configured');
      }

      // 獲取訪問令牌
      const accessToken = await this.getAccessToken();
      
      // 準備 SMS 數據
      const smsData = {
        to: phoneNumber,
        message: `Your HiHiTutor verification code is ${otp}. Valid for 10 minutes.`,
        from: senderId // 可選的發送者ID
      };

      console.log('📱 SMS 發送參數:', {
        to: phoneNumber,
        message: smsData.message.substring(0, 30) + '...',
        from: senderId || 'default'
      });

      // 發送 SMS
      const response = await axios.post(`${this.baseURL}/messages/sms`, smsData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 15000 // 15秒超時
      });

      console.log('✅ SMS 發送成功:', {
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        message: 'SMS sent successfully',
        data: response.data,
        otp: otp
      };

    } catch (error) {
      console.error('❌ SMS 發送失敗:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      throw new Error(error.response?.data?.message || error.message || 'Failed to send SMS');
    }
  }

  // 驗證香港電話號碼格式
  validateHongKongPhone(phoneNumber) {
    // 移除所有空格和特殊字符
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // 檢查是否以 +852 開頭
    if (cleanNumber.startsWith('+852')) {
      const numberAfterCode = cleanNumber.substring(4);
      // 香港手機號碼通常是 8 位數字
      return /^\d{8}$/.test(numberAfterCode);
    }
    
    // 檢查是否以 852 開頭（沒有 +）
    if (cleanNumber.startsWith('852')) {
      const numberAfterCode = cleanNumber.substring(3);
      return /^\d{8}$/.test(numberAfterCode);
    }
    
    // 檢查是否直接是 8 位數字（本地格式）
    if (/^\d{8}$/.test(cleanNumber)) {
      return true;
    }
    
    return false;
  }

  // 格式化香港電話號碼
  formatHongKongPhone(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (cleanNumber.startsWith('+852')) {
      return cleanNumber;
    }
    
    if (cleanNumber.startsWith('852')) {
      return '+' + cleanNumber;
    }
    
    if (/^\d{8}$/.test(cleanNumber)) {
      return '+852' + cleanNumber;
    }
    
    return phoneNumber; // 如果無法格式化，返回原始號碼
  }
}

module.exports = new SMSService(); 