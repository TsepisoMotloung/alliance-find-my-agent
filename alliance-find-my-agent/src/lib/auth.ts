import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import Agent from "@/models/agent";
import Employee from "@/models/employee";
import { ApprovalStatus, UserRole } from "@/types/models";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials");
          }

          // Find the user in the database
          const user = await User.findOne({
            where: { email: credentials.email },
            include: [
              { model: Agent, as: "agent" },
              { model: Employee, as: "employee" },
            ],
          });

          if (!user) {
            throw new Error("User not found");
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error("Account is deactivated");
          }

          // For non-admin users, check approval status
          if (
            user.role !== UserRole.ADMIN &&
            user.approvalStatus !== ApprovalStatus.APPROVED
          ) {
            throw new Error(
              user.approvalStatus === ApprovalStatus.PENDING
                ? "Your account is pending approval"
                : "Your account has been rejected",
            );
          }

          // Check if the password is correct
          const isValidPassword = await user.validatePassword(
            credentials.password,
          );
          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          // Return the user data
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            approvalStatus: user.approvalStatus,
            isActive: user.isActive,
          };
        } catch (error: any) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || `${user.firstName} ${user.lastName}`;
        token.role = user.role;
        token.approvalStatus = user.approvalStatus;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role as UserRole;
        session.user.approvalStatus = token.approvalStatus as ApprovalStatus;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: "beDpfsDMdR7GRKaFVXuGSvqmJoks+A0LIiWxtN+nVIw=",
  // secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Helper functions for role-based access control
export const isAdmin = (role: UserRole) => role === UserRole.ADMIN;
export const isAgent = (role: UserRole) => role === UserRole.AGENT;
export const isEmployee = (role: UserRole) => role === UserRole.EMPLOYEE;
export const isUser = (role: UserRole) => role === UserRole.USER;
export const isStaff = (role: UserRole) =>
  role === UserRole.ADMIN ||
  role === UserRole.AGENT ||
  role === UserRole.EMPLOYEE;
