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

export interface IFLEARN_REFRESH_TOKEN {
  FLEARN_ACCESS_TOKEN: string;
  FLEARN_REFRESH_TOKEN: string;
  FLEARN_ACCESS_TOKENExpires: string;
  FLEARN_REFRESH_TOKENExpires: string;
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
