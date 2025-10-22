/**
 * Reset password API route
 * Resets user password after OTP verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Verify OTP first
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.otpCode || !user.otpExpires) {
      return NextResponse.json(
        { error: 'No OTP found for this email' },
        { status: 400 }
      );
    }

    if (user.otpCode !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
      }
    });

    return NextResponse.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}