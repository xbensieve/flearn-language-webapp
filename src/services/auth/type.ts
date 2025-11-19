export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  user: {
    userID: string;
    userName: string;
    email: string;
    isEmailConfirmed: boolean;
    createdAt: string;
    lastAccessAt: string;
  };
  roles: string[];
}

export interface ProfileResponse {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  roles: string[];
}

export interface TeacherProfile {
  profile: Profile
  wallet: Wallet
}

export interface Profile {
  teacherId: string
  language: string
  fullName: string
  dateOfBirth: string
  bio: string
  avatar: string
  email: string
  phoneNumber: string
  proficiencyCode: string
  averageRating: number
  reviewCount: number
  meetingUrl: string
}

export interface Wallet {
  walletId: string
  totalBalance: number
  availableBalance: number
  holdBalance: number
  currency: string
}


export interface IRefreshToken {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  user: User;
  roles: string[];
}

export interface User {
  userID: string;
  userName: string;
  email: string;
  isEmailConfirmed: boolean;
  createdAt: string;
  lastAccessAt: string;
}

export interface ResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}
