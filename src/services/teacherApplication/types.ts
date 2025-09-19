// Response for language list
export interface Language {
  languageId: string;
  languageName: string;
  languageCode: string;
}

// Request payload for teacher application
export interface TeacherApplicationRequest {
  LanguageID: string;
  Motivation: string;
  CredentialFiles: File[];
  CredentialNames: string[];
  CredentialTypes: number[];
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
  teacherApplicationID: string;
  userID: string;
  userName: string;
  email: string;
  languageID: string;
  languageName: string;
  motivation: string;
  appliedAt: string;
  submitAt: string;
  reviewAt?: string | null;
  reviewedBy?: string | null;
  reviewerName?: string | null;
  rejectionReason: string;
  status: number;
  credentials: Credential[];
  createdAt: string;
}
