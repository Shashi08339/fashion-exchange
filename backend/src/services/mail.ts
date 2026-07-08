// backend/src/services/mail.ts
import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '0');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn('[Mail Service] SMTP credentials are not configured. Falling back to local stream transport for development/testing.');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

export const sendOTPEmail = async (to: string, otp: string, purpose: string): Promise<void> => {
  const transporter = createTransporter();
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 600px; color: #1f2937;">
      <h2 style="color: #059669; font-weight: 700; font-size: 24px;">Fashion Exchange</h2>
      <p style="font-size: 16px; margin-top: 16px;">Here is your secure verification code for <strong>${purpose}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280;">This code is valid for exactly 15 minutes. If you did not trigger this request, please safely disregard this email.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Fashion Exchange Sustainable Platforms Inc.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Fashion Exchange Support" <${process.env.SMTP_FROM || 'noreply@fashionexchange.ai'}>`,
      to,
      subject: `Fashion Exchange Security Code: ${otp}`,
      html: htmlContent
    });

    if ((transporter as any).options?.streamTransport) {
      console.info('[Mail Service] OTP transport used local stream transport.');
      console.info('[Mail Service] OTP payload:', otp);
      console.info('[Mail Service] Generated message preview:', info.messageId || JSON.stringify(info));
    }
  } catch (err: any) {
    console.error('[Mail Service] SMTP transmission failed:', err.message);
    console.info('\n======================================================');
    console.info(`  LOCAL DEV OTP CODE BYPASS FOR ${to}`);
    console.info(`  Verification Secure Code: ${otp}`);
    console.info('======================================================\n');
  }
};