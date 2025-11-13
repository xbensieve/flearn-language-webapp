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
