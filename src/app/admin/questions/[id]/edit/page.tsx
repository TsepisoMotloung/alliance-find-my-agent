
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Question } from "@/models";
import { UserRole } from "@/types/models";
import QuestionForm from "@/components/forms/QuestionForm";

interface Props {
  params: { id: string };
}

export default async function EditQuestionPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedParams = await params;

  try {
    const question = await Question.findByPk(resolvedParams.id);

    if (!question) {
      notFound();
    }

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl">
                Edit Rating Question
              </h1>
              <p className="mt-1 text-alliance-gray-500">
                Update the {question.targetRole} rating question
              </p>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <QuestionForm 
                  targetRole={question.targetRole}
                  question={{
                    id: question.id,
                    question: question.question,
                    order: question.order,
                    isActive: question.isActive,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching question:", error);
    notFound();
  }
}
