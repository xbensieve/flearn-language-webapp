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
  userID: string;
  languageID: string;
  reviewedBy: any;
  reviewedByName: any;
  user: User;
  applicationID: string;
  language: string;
  fullName: string;
  dateOfBirth: string;
  bio: string;
  avatar: string;
  email: string;
  phoneNumber: string;
  teachingExperience: string;
  proficiencyCode: string;
  meetingUrl: string;
  rejectionReason: any;
  status: string;
  submittedAt: string;
  reviewedAt: string;
  certificates: Certificate[];
  submitter: Submitter;
  reviewer: any;
}

export interface GetMyApplicationsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: 'newest' | 'oldest';
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface Certificate {
  id: string;
  certificateImageUrl: string;
  certificateName: string;
}

export interface Submitter {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
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
