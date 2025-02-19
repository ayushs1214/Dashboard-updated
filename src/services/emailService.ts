import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const emailService = {
  async sendPasswordResetEmail(email: string, resetToken: string) {
    try {
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      await resend.emails.send({
        from: 'noreply@milagro.com',
        to: email,
        subject: 'Reset Your Password - Milagro Admin',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  },

  async sendOtpEmail(email: string, otp: string) {
    try {
      await resend.emails.send({
        from: 'noreply@milagro.com',
        to: email,
        subject: 'Your OTP Code - Milagro Admin',
        html: `
          <h2>Your One-Time Password</h2>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }
};