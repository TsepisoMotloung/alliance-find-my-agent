
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { UserRole } from "@/types/models";
import QuestionForm from "@/components/forms/QuestionForm";

interface SearchParams {
  targetRole?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function NewQuestionPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const targetRole = resolvedSearchParams.targetRole as "agent" | "employee" || "agent";

  return (
    <MainLayout>
      <div className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl">
              Add New Rating Question
            </h1>
            <p className="mt-1 text-alliance-gray-500">
              Create a new question for {targetRole} ratings
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <QuestionForm targetRole={targetRole} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
