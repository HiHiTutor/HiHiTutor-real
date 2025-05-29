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
}

module.exports = new EmailService(); 