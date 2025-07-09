const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetPasswordEmail(to, resetLink) {
  const info = await transporter.sendMail({
    from: `"HiHiTutor" <${process.env.SMTP_FROM}>`,
    to,
    subject: '🔑 重設 HiHiTutor 密碼',
    html: `
      <p>您好，</p>
      <p>請點擊以下連結以重設您的 HiHiTutor 密碼：</p>
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
      <p>此連結將於 15 分鐘後失效。</p>
    `,
  });

  console.log(`📧 Reset email sent: ${info.messageId}`);
}

module.exports = { sendResetPasswordEmail }; 