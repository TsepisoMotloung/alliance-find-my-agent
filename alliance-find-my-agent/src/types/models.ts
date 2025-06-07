export enum UserRole {
  ADMIN = "admin",
  AGENT = "agent",
  EMPLOYEE = "employee",
  USER = "user",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgent {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization?: string;
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: Date;
  isAvailable: boolean;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployee {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  position: string;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRating {
  id: string;
  targetId: string; // userId of agent or employee
  targetRole: "agent" | "employee";
  raterId?: string; // userId of rater (if registered)
  raterEmail?: string; // email of rater (if not registered)
  raterName?: string; // name of rater (if not registered)
  score: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComplaint {
  id: string;
  targetId: string; // userId of agent or employee
  targetRole: "agent" | "employee";
  complainantId?: string; // userId of complainant (if registered)
  complainantEmail?: string; // email of complainant (if not registered)
  complainantName?: string; // name of complainant (if not registered)
  subject: string;
  description: string;
  status: "open" | "under-review" | "resolved" | "closed";
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallback {
  id: string;
  agentId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  purpose: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  notes?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
