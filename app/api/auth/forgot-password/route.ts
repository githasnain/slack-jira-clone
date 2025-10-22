import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, we sent a password reset code.'
      });
    }

    // Generate OTP
    const otpCode = randomBytes(3).toString('hex').toUpperCase();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpires,
      }
    });

    // Log password reset request
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        details: `Password reset requested for ${user.email}`
      }
    });

    // In a real app, you would send this OTP via email
    // For demo purposes, we'll return it in the response
    console.log(`Password reset OTP for ${email}: ${otpCode}`);

    return NextResponse.json({
      message: 'Password reset code sent to your email',
      // Remove this in production - only for demo
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
