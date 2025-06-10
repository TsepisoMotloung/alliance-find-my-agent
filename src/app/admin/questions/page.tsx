
import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Question } from "@/models";
import { UserRole } from "@/types/models";

interface SearchParams {
  targetRole?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function AdminQuestionsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const targetRoleFilter = searchParams.targetRole || "agent";

  try {
    const questions = await Question.findAll({
      where: {
        targetRole: targetRoleFilter as "agent" | "employee"
      },
      order: [["order", "ASC"], ["createdAt", "ASC"]],
    });

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Manage Rating Questions
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  Configure questions that appear on rating forms
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href={`/admin/questions/new?targetRole=${targetRoleFilter}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                >
                  Add New Question
                </Link>
              </div>
            </div>

            {/* Role Filter */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <div className="flex space-x-4">
                <Link
                  href="/admin/questions?targetRole=agent"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    targetRoleFilter === "agent"
                      ? "bg-alliance-red-600 text-white"
                      : "bg-alliance-gray-100 text-alliance-gray-700 hover:bg-alliance-gray-200"
                  }`}
                >
                  Agent Questions
                </Link>
                <Link
                  href="/admin/questions?targetRole=employee"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    targetRoleFilter === "employee"
                      ? "bg-alliance-red-600 text-white"
                      : "bg-alliance-gray-100 text-alliance-gray-700 hover:bg-alliance-gray-200"
                  }`}
                >
                  Employee Questions
                </Link>
              </div>
            </div>

            {/* Questions List */}
            <div className="mt-8">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-alliance-gray-900">
                    No questions found
                  </h3>
                  <p className="mt-1 text-sm text-alliance-gray-500">
                    Get started by creating a new question for {targetRoleFilter}s.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/admin/questions/new?targetRole=${targetRoleFilter}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                    >
                      Add Question
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-lg shadow p-6 border border-alliance-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-alliance-red-100 text-alliance-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {question.order || index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-lg font-medium text-alliance-gray-900">
                                {question.question}
                              </p>
                              <div className="mt-2 flex items-center space-x-4">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    question.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {question.isActive ? "Active" : "Inactive"}
                                </span>
                                <span className="text-sm text-alliance-gray-500">
                                  Order: {question.order}
                                </span>
                                <span className="text-sm text-alliance-gray-500">
                                  Created: {new Date(question.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link
                            href={`/admin/questions/${question.id}/edit`}
                            className="text-alliance-red-600 hover:text-alliance-red-900 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/questions/${question.id}/delete`}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-alliance-blue-50 border border-alliance-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-alliance-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-alliance-blue-800">
                    About Rating Questions
                  </h3>
                  <div className="mt-2 text-sm text-alliance-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Questions are displayed on rating forms based on whether an agent or employee is being rated
                      </li>
                      <li>
                        The order determines the sequence in which questions appear
                      </li>
                      <li>
                        Only active questions will be shown to users
                      </li>
                      <li>
                        Users will still provide a star rating (1-5) regardless of questions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading questions
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading questions. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
