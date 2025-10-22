import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, otpCode, newPassword } = await request.json();

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP code, and new password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP code' },
        { status: 400 }
      );
    }

    // Check OTP
    if (!user.otpCode || !user.otpExpires) {
      return NextResponse.json(
        { error: 'No password reset request found' },
        { status: 400 }
      );
    }

    if (user.otpCode !== otpCode) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    if (user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: 'OTP code has expired' },
        { status: 400 }
      );
    }

    // Validate new password before hashing
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be a string with at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
        loginAttempts: 0,
        lockedUntil: null,
      }
    });

    // Log password reset
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_SUCCESS',
        details: `Password reset completed for ${user.email}`
      }
    });

    return NextResponse.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
