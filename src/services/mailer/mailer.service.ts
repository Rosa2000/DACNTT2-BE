import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CustomMailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  /**
   * Gửi email đặt lại mật khẩu
   * @param to email người nhận
   * @param token JWT token để reset mật khẩu
   */
  async sendResetPasswordMail(to: string, token: string): Promise<void> {
    const resetLink = `https://ezenglish.io.vn/auth/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Đặt lại mật khẩu - EZEnglish',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5">
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
          <a href="${resetLink}" 
             style="display:inline-block;padding:10px 20px;margin-top:10px;background:#58cc02;color:#fff;text-decoration:none;border-radius:4px;">
            Đặt lại mật khẩu
          </a>
          <p style="margin-top:20px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ EZEnglish</p>
        </div>
      `,
    });
  }

  /**
   * Gửi email thông báo chung
   */
  async sendGenericEmail(to: string, subject: string, content: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5">${content}</div>`,
    });
  }
}
