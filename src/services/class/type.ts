export interface Class {
  classID: string;
  title: string;
  description: string;
  languageID: string;
  languageName: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  pricePerStudent: number;
  googleMeetLink: string;
  status: string;
  currentEnrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  title: string;
  description: string;
  languageID: string;
  classDate: string;
  startTime: string;
  durationMinutes: number;
  pricePerStudent: number;
  googleMeetLink: string;
}
