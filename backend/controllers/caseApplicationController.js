const cases = require('../data/cases');

// 模擬應徵記錄儲存
const applications = [];

// 應徵個案
const applyCase = (req, res) => {
  const caseId = parseInt(req.params.id);
  const { tutorId } = req.body;

  // 檢查個案是否存在
  const case_ = cases.find(c => c.id === caseId);
  if (!case_) {
    return res.status(404).json({
      error: '找不到此個案'
    });
  }

  // 檢查是否重複應徵
  const existingApplication = applications.find(
    app => app.caseId === caseId && app.tutorId === tutorId
  );

  if (existingApplication) {
    return res.status(400).json({
      error: '您已經應徵過此個案'
    });
  }

  // 儲存應徵記錄
  const application = {
    id: applications.length + 1,
    caseId,
    tutorId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  applications.push(application);

  // 模擬儲存到資料庫
  console.log('新增應徵記錄:', application);

  // 回傳成功訊息
  res.status(200).json({
    message: '已成功應徵此個案',
    application
  });
};

module.exports = {
  applyCase
}; 