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

export interface IRefreshToken {
  accessToken: string
  refreshToken: string
  accessTokenExpires: string
  refreshTokenExpires: string
  user: User
  roles: string[]
}

export interface User {
  userID: string
  userName: string
  email: string
  isEmailConfirmed: boolean
  createdAt: string
  lastAccessAt: string
}
