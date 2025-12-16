export enum AttendanceType {
  ABSENCE = '결석',
  LATE = '지각',
  EARLY_LEAVE = '조퇴',
}

export enum AttendanceReason {
  SICK = '질병',
  RECOGNIZED = '인정',
}

export interface FormConfig {
  formUrl: string; // The base URL for formResponse
  studentIdEntry: string; // entry.xxxx for Student ID
  typeEntry: string; // entry.xxxx for Type
  reasonEntry: string; // entry.xxxx for Reason
  guardianEntry?: string; // entry.xxxx for Guardian Check (Optional in older configs, mandatory in new)
}

export interface StudentProfile {
  studentId: string;
}

export interface SubmissionData {
  studentId: string;
  type: AttendanceType;
  reason: AttendanceReason;
  guardianChecked: boolean;
}