const tutors = require('../data/tutors');

// 模擬申請記錄儲存
const applications = [];

// 申請配對導師
const applyTutor = (req, res) => {
  const tutorId = parseInt(req.params.id);
  const { studentId } = req.body;

  // 檢查導師是否存在
  const tutor = tutors.find(t => t.id === tutorId);
  if (!tutor) {
    return res.status(404).json({
      error: '找不到此導師'
    });
  }

  // 檢查是否重複申請
  const existingApplication = applications.find(
    app => app.tutorId === tutorId && app.studentId === studentId
  );

  if (existingApplication) {
    return res.status(400).json({
      error: '您已經申請過此導師'
    });
  }

  // 儲存申請記錄
  const application = {
    id: applications.length + 1,
    tutorId,
    studentId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  applications.push(application);

  // 模擬儲存到資料庫
  console.log('新增申請記錄:', application);

  // 回傳成功訊息
  res.status(200).json({
    message: '已成功申請配對此導師',
    application
  });
};

module.exports = {
  applyTutor
}; 