const express = require('express');
const router = express.Router();
const fixTutorIdIndexProduction = require('../scripts/fixTutorIdIndexProduction');

// 修復 tutorId 索引的 API 端點
router.post('/fix-tutorid-index', async (req, res) => {
  try {
    console.log('🔧 開始修復 tutorId 索引...');
    
    const result = await fixTutorIdIndexProduction();
    
    if (result.success) {
      console.log('✅ 索引修復成功:', result);
      res.json({
        success: true,
        message: 'tutorId 索引修復成功',
        data: result
      });
    } else {
      console.error('❌ 索引修復失敗:', result.error);
      res.status(500).json({
        success: false,
        message: 'tutorId 索引修復失敗',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ 修復索引時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '修復索引時發生錯誤',
      error: error.message
    });
  }
});

module.exports = router; 