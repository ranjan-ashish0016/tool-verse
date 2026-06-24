export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: string;
}

export interface GstHistoryRecord {
  id?: string;
  userId: string;
  toolName: "GST Calculator";
  timestamp: any; // Firestore Timestamp or string representation
  amount: number;
  gstRate: number;
  gstAmount: number;
  finalAmount: number;
  calculationType: "add" | "remove";
}

export interface EmiHistoryRecord {
  id?: string;
  userId: string;
  toolName: "EMI Calculator";
  timestamp: any;
  loanAmount: number;
  interestRate: number;
  loanTenure: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
}

export interface AgeHistoryRecord {
  id?: string;
  userId: string;
  toolName: "Age Calculator";
  timestamp: any;
  dob: string; // ISO or YYYY-MM-DD string
  years: number;
  months: number;
  days: number;
  totalDays: number;
  countdownToNextBirthday: number; // in days
}

export interface QrHistoryRecord {
  id?: string;
  userId: string;
  toolName: "QR Code Generator";
  timestamp: any;
  type: "text" | "url" | "email" | "phone";
  inputData: string;
  shareable?: boolean;
}

export interface PasswordHistoryRecord {
  id?: string;
  userId: string;
  toolName: "Password Generator";
  timestamp: any;
  length: number;
  strength: "Weak" | "Medium" | "Strong" | "Very Strong";
  generatedPassword: string; // censored in list for privacy or toggleable
  config: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export type HistoryRecord =
  | (GstHistoryRecord & { id: string })
  | (EmiHistoryRecord & { id: string })
  | (AgeHistoryRecord & { id: string })
  | (QrHistoryRecord & { id: string })
  | (PasswordHistoryRecord & { id: string });
