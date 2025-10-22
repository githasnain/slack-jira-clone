/**
 * Email service for OTP and password reset functionality
 */

import { prisma } from './prisma';
import { randomBytes } from 'crypto';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Generate OTP code
   */
  public generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP for password reset
   */
  public async sendPasswordResetOTP(email: string): Promise<{ success: boolean; otp?: string; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const otp = this.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpires: otpExpires,
        }
      });

      // In a real application, you would send the email here
      // For now, we'll just log it
      console.log(`Password reset OTP for ${email}: ${otp}`);
      console.log(`OTP expires at: ${otpExpires}`);

      return { success: true, otp };
    } catch (error) {
      console.error('Error sending password reset OTP:', error);
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  /**
   * Verify OTP code
   */
  public async verifyOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.otpCode || !user.otpExpires) {
        return { success: false, error: 'No OTP found' };
      }

      if (user.otpCode !== otp) {
        return { success: false, error: 'Invalid OTP' };
      }

      if (new Date() > user.otpExpires) {
        return { success: false, error: 'OTP expired' };
      }

      // Clear OTP after successful verification
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: null,
          otpExpires: null,
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'Failed to verify OTP' };
    }
  }

  /**
   * Generate password reset token
   */
  public generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const resetToken = this.generateResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        }
      });

      // In a real application, you would send the email here
      // For now, we'll just log it
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset token expires at: ${resetExpires}`);

      return { success: true, token: resetToken };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  }

  /**
   * Verify password reset token
   */
  public async verifyResetToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return { success: false, error: 'Invalid or expired token' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return { success: false, error: 'Failed to verify token' };
    }
  }

  /**
   * Clear password reset token
   */
  public async clearResetToken(email: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }
      });
    } catch (error) {
      console.error('Error clearing reset token:', error);
    }
  }
}
