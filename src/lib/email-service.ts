// Email service for password reset functionality
// In production, you would use a service like SendGrid, AWS SES, or Nodemailer

interface PasswordResetData {
  resetToken: string
  otpCode: string
  resetLink: string
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  data: PasswordResetData
): Promise<void> {
  try {
    // In development, we'll just log the email content
    // In production, replace this with actual email sending service
    console.log('📧 Password Reset Email:')
    console.log('To:', email)
    console.log('Name:', name)
    console.log('Reset Link:', data.resetLink)
    console.log('OTP Code:', data.otpCode)
    console.log('---')

    // For development purposes, we'll simulate email sending
    // In production, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    // - Mailgun

    // Example with Nodemailer (uncomment and configure for production):
    /*
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: generatePasswordResetHTML(name, data),
    }

    await transporter.sendMail(mailOptions)
    */

    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 100))
    
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

function generatePasswordResetHTML(name: string, data: PasswordResetData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .otp-box { background: #e5e7eb; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>You have requested to reset your password. You can reset your password using one of the following methods:</p>
          
          <h3>Method 1: Use the Reset Link</h3>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" class="button">Reset Password</a>
          
          <h3>Method 2: Use the OTP Code</h3>
          <p>Enter this code in the password reset form:</p>
          <div class="otp-box">${data.otpCode}</div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>The reset link expires in 15 minutes</li>
            <li>The OTP code expires in 10 minutes</li>
            <li>If you didn't request this reset, please ignore this email</li>
          </ul>
        </div>
        <div class="footer">
          <p>This email was sent from your Slack Jira Clone application.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email verification service (for future use)
export async function sendEmailVerification(
  email: string,
  name: string,
  verificationToken: string
): Promise<void> {
  try {
    console.log('📧 Email Verification:')
    console.log('To:', email)
    console.log('Name:', name)
    console.log('Verification Token:', verificationToken)
    console.log('---')

    // In production, implement actual email sending here
    await new Promise(resolve => setTimeout(resolve, 100))
    
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error
  }
}
