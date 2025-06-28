const axios = require('axios');

const API_BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api';

// 測試拒絕導師資料的 API
async function testRejectTutorProfile() {
  try {
    console.log('🧪 測試拒絕導師資料 API...');
    
    // 首先獲取一個待審核的導師
    console.log('1. 獲取待審核導師列表...');
    const pendingResponse = await axios.get(`${API_BASE_URL}/tutor-profiles/pending`);
    
    if (!pendingResponse.data.success || !pendingResponse.data.data || pendingResponse.data.data.length === 0) {
      console.log('❌ 沒有找到待審核的導師');
      return;
    }
    
    const tutor = pendingResponse.data.data[0];
    console.log('✅ 找到待審核導師:', {
      id: tutor._id,
      name: tutor.name,
      email: tutor.email,
      profileStatus: tutor.profileStatus
    });
    
    // 測試拒絕 API
    console.log('2. 測試拒絕 API...');
    const rejectData = {
      remarks: '測試拒絕原因 - 資料不完整'
    };
    
    console.log('發送拒絕請求:', {
      url: `${API_BASE_URL}/tutor-profiles/${tutor._id}/reject`,
      data: rejectData
    });
    
    const rejectResponse = await axios.patch(
      `${API_BASE_URL}/tutor-profiles/${tutor._id}/reject`,
      rejectData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 拒絕 API 回應:', {
      status: rejectResponse.status,
      data: rejectResponse.data
    });
    
    // 驗證狀態是否已更新
    console.log('3. 驗證狀態更新...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/tutor-profiles/pending`);
    
    const updatedTutor = verifyResponse.data.data.find(t => t._id === tutor._id);
    if (!updatedTutor) {
      console.log('✅ 導師已從待審核列表中移除');
    } else {
      console.log('❌ 導師仍在待審核列表中:', updatedTutor.profileStatus);
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

// 測試空 remarks 的情況
async function testRejectWithEmptyRemarks() {
  try {
    console.log('\n🧪 測試空 remarks 的情況...');
    
    // 獲取待審核導師
    const pendingResponse = await axios.get(`${API_BASE_URL}/tutor-profiles/pending`);
    
    if (!pendingResponse.data.success || !pendingResponse.data.data || pendingResponse.data.data.length === 0) {
      console.log('❌ 沒有找到待審核的導師');
      return;
    }
    
    const tutor = pendingResponse.data.data[0];
    
    // 測試空 remarks
    const rejectData = {
      remarks: ''
    };
    
    console.log('發送空 remarks 拒絕請求...');
    
    const rejectResponse = await axios.patch(
      `${API_BASE_URL}/tutor-profiles/${tutor._id}/reject`,
      rejectData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('❌ 應該失敗但成功了:', rejectResponse.data);
    
  } catch (error) {
    console.log('✅ 正確地拒絕了空 remarks:', {
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// 執行測試
async function runTests() {
  console.log('🚀 開始測試導師資料拒絕功能...\n');
  
  await testRejectTutorProfile();
  await testRejectWithEmptyRemarks();
  
  console.log('\n🏁 測試完成');
}

runTests(); 