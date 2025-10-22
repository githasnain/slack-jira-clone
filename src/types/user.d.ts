export interface User {
  id: string;
  name: string | null;
  email: string;
  password?: string;
  emailVerified?: Date | null;
  image?: string | null;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  role: 'ADMIN' | 'MEMBER' | 'GUEST';
  bio?: string | null;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Password reset fields
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  otpCode?: string | null;
  otpExpires?: Date | null;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expires: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
