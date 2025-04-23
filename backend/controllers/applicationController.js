// 模擬申請記錄儲存
const applications = [
  {
    id: 1,
    caseId: 1,
    tutorId: 123,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    caseId: 2,
    tutorId: 123,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    caseId: 3,
    tutorId: 123,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    caseId: 4,
    tutorId: 123,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// 批准申請
const approveApplication = (req, res) => {
  const applicationId = parseInt(req.params.id);

  // 檢查申請是否存在
  const application = applications.find(app => app.id === applicationId);
  if (!application) {
    return res.status(404).json({
      error: '找不到此申請'
    });
  }

  // 更新申請狀態
  application.status = 'approved';
  application.updatedAt = new Date().toISOString();

  // 模擬儲存到資料庫
  console.log('更新申請狀態:', application);

  // 回傳成功訊息
  res.status(200).json({
    message: '申請已批准',
    application
  });
};

// 拒絕申請
const rejectApplication = (req, res) => {
  const applicationId = parseInt(req.params.id);

  // 檢查申請是否存在
  const application = applications.find(app => app.id === applicationId);
  if (!application) {
    return res.status(404).json({
      error: '找不到此申請'
    });
  }

  // 更新申請狀態
  application.status = 'rejected';
  application.updatedAt = new Date().toISOString();

  // 模擬儲存到資料庫
  console.log('更新申請狀態:', application);

  // 回傳成功訊息
  res.status(200).json({
    message: '申請已拒絕',
    application
  });
};

module.exports = {
  approveApplication,
  rejectApplication
}; 