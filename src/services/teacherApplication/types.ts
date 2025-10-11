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
  CertificateImages: any[];
  CertificateTypeIds: string[];
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
  birthDate: string;
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
  language: Language;
  user: User;
  certificates: any[];
}

export interface User {
  userId: string;
  userName: string;
  email: string;
}
