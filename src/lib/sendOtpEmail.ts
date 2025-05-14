import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }as SMTPTransport.Options);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
