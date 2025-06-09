import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApprovalStatus } from "@/types/models";
import MainLayout from "@/components/layouts/MainLayout";
import Button from "@/components/ui/Button";
import { signOut } from "next-auth/react";

export default async function ApprovalPage() {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  // If already approved, redirect to appropriate dashboard
  if (session.user.approvalStatus === ApprovalStatus.APPROVED) {
    if (session.user.role === "admin") {
      redirect("/admin");
    } else if (session.user.role === "agent") {
      redirect("/agent");
    } else if (session.user.role === "employee") {
      redirect("/employee");
    } else {
      redirect("/");
    }
  }

  // Check if approved or rejected
  const isPending = session.user.approvalStatus === ApprovalStatus.PENDING;
  const isRejected = session.user.approvalStatus === ApprovalStatus.REJECTED;

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto p-6 bg-white shadow-sm rounded-lg border border-alliance-gray-200">
          <div className="text-center">
            {isPending ? (
              <>
                <div className="h-16 w-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-alliance-gray-900 mb-2">
                  Your Account is Pending Approval
                </h2>
                <p className="text-alliance-gray-600 mb-6">
                  Thank you for registering! Your account is currently being
                  reviewed by our administrators. You'll receive an email
                  notification once your account is approved.
                </p>
              </>
            ) : (
              <>
                <div className="h-16 w-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-alliance-gray-900 mb-2">
                  Your Registration was Rejected
                </h2>
                <p className="text-alliance-gray-600 mb-6">
                  We're sorry, but your registration request has been rejected.
                  This could be due to incomplete or incorrect information.
                  Please contact our support team for assistance.
                </p>
              </>
            )}

            <div className="flex flex-col space-y-3">
              <Button href="/" variant="outline">
                Return to Home
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ callbackUrl: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-alliance-gray-500 hover:text-alliance-red-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
