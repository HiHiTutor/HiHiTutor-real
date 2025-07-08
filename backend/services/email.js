const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, text, html) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Email would be sent to:', to);
        console.log('Subject:', subject);
        console.log('Text content:', text);
        return true;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendApplicationNotification(to, caseTitle, applicantName) {
    const subject = `新的課程申請 - ${caseTitle}`;
    const text = `你好！\n\n${applicantName} 已申請你的課程 "${caseTitle}"。\n\n請登入 HiHiTutor 查看詳情。`;
    const html = `
      <h2>新的課程申請</h2>
      <p>你好！</p>
      <p><strong>${applicantName}</strong> 已申請你的課程 "<strong>${caseTitle}</strong>"。</p>
      <p>請登入 HiHiTutor 查看詳情。</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  async sendApplicationStatusUpdate(to, caseTitle, status) {
    const statusText = status === 'accepted' ? '接受' : '拒絕';
    const subject = `課程申請狀態更新 - ${caseTitle}`;
    const text = `你好！\n\n你申請的課程 "${caseTitle}" 已被${statusText}。\n\n請登入 HiHiTutor 查看詳情。`;
    const html = `
      <h2>課程申請狀態更新</h2>
      <p>你好！</p>
      <p>你申請的課程 "<strong>${caseTitle}</strong>" 已被<strong>${statusText}</strong>。</p>
      <p>請登入 HiHiTutor 查看詳情。</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  async sendPasswordResetEmail(to, userName, resetToken) {
    const resetUrl = `https://hi-hi-tutor-real.vercel.app/reset-password?token=${resetToken}`;
    const subject = 'HiHiTutor - 重設密碼';
    const text = `你好 ${userName}！\n\n你要求重設 HiHiTutor 帳戶的密碼。\n\n請點擊以下連結重設密碼：\n${resetUrl}\n\n此連結將在1小時後過期。\n\n如果你沒有要求重設密碼，請忽略此email。\n\n謝謝！\nHiHiTutor 團隊`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">HiHiTutor - 重設密碼</h2>
        <p>你好 <strong>${userName}</strong>！</p>
        <p>你要求重設 HiHiTutor 帳戶的密碼。</p>
        <p>請點擊以下按鈕重設密碼：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">重設密碼</a>
        </div>
        <p>或者複製以下連結到瀏覽器：</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>此連結將在1小時後過期。</strong></p>
        <p>如果你沒有要求重設密碼，請忽略此email。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">謝謝！<br>HiHiTutor 團隊</p>
      </div>
    `;

    return this.sendEmail(to, subject, text, html);
  }
}

module.exports = new EmailService(); 