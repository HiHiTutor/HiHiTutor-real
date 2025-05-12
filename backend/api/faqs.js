export default function handler(req, res) {
  // 假資料
  const faqsByCategory = {
    '一般問題': [
      { question: '如何註冊帳號？', answer: '點擊右上角註冊，填寫資料即可。' },
      { question: '如何重設密碼？', answer: '請至登入頁點選「忘記密碼」。' }
    ],
    '收費問題': [
      { question: '平台收費嗎？', answer: '目前平台免費使用。' }
    ],
    '課程問題': [
      { question: '如何搜尋課程？', answer: '請使用首頁搜尋功能。' }
    ],
    '其他': [
      { question: '有其他問題怎麼辦？', answer: '請聯絡我們的客服。' }
    ]
  };
  res.status(200).json({
    success: true,
    data: faqsByCategory
  });
} 