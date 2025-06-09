import NextAuth from "next-auth";
import { UserRole, ApprovalStatus } from './models';

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      approvalStatus: ApprovalStatus;
      isActive: boolean;
    };
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    email: string;
    name?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    approvalStatus: ApprovalStatus;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    approvalStatus: ApprovalStatus;
    isActive: boolean;
  }
}