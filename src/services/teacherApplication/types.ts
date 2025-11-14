/* eslint-disable @typescript-eslint/no-explicit-any */
// Response for language list
export interface Language {
  id: string;
  langName: string;
  langCode: string;
}

// Request payload for teacher application
export interface TeacherApplicationRequest {
  LangCode: string;
  FullName: string;
  BirthDate: string;
  Bio: string;
  Avatar?: File;
  Email: string;
  PhoneNumber: string;
  TeachingExperience: string;
  MeetingUrl: string;
  CertificateImages: File[];
  CertificateTypeIds: string[];
  ProficiencyCode: string;
}

// src/services/teacherApplication/types.ts
export interface Credential {
  teacherCredentialID: string;
  credentialName: string;
  credentialFileUrl: string;
  type: number;
  createdAt: string;
}

export interface ApplicationData {
  applicationID: string;
  userID: string;
  languageID: string;
  fullName: string;
  dateOfBirth: string;
  bio: string;
  avatar: string;
  email: string;
  phoneNumber: string;
  teachingExperience: string;
  meetingUrl: string;
  rejectionReason: any;
  status: string;
  reviewedBy: any;
  reviewedByName: any;
  submittedAt: string;
  reviewedAt: string;
  language: string;
  user: User;
  certificates: any[];
}

export interface User {
  userId: string;
  userName: string;
  email: string;
}

export interface BankAccountRequest {
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface BankAccountResponse {
  bankAccountId: string;
  teacherId: string;
  bankBranch: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  errors?: string;
  meta?: string;
}

export interface PayoutRequest {
  amount: number;
  bankAccountId: string;
}
