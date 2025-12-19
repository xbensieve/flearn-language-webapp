export interface Class {
  classID: string;
  title: string;
  description: string;
  languageID: string;
  languageName: string;
  programAssignmentId?: string;
  programName?: string;
  levelName?: string;
  durationMinutes?: number;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  minStudents: number;
  pricePerStudent: number;
  googleMeetLink: string;
  status: string;
  // Lý do hủy (có thể có nhiều tên trường tuỳ API)
  cancelReason?: string;
  cancellationReason?: string;
  cancel_reason?: string;
  currentEnrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  title: string;
  description: string;
  classDate: string;
  startTime: string;
  durationMinutes: number;
  pricePerStudent: number;
  minStudents: number;
  capacity: number;
  programAssignmentId: string;
}

export interface ClassEnrollment {
  enrollmentID: string;
  classID: string;
  studentID: string;
  userName: string;
  studentEmail: string;
  amountPaid: number;
  paymentTransactionId: string;
  status: 'Paid' | 'Pending' | 'Refunded';
  enrolledAt: string;
  updatedAt: string;
}

export interface ClassEnrollmentResponse {
  success: boolean;
  message: string;
  data: ClassEnrollment[];
  total: number;
  statistics: {
    totalEnrollments: number;
    paidEnrollments: number;
    pendingEnrollments: number;
  };
}
