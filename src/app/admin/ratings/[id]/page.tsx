
import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Rating, User, Question, QuestionRating } from "@/models";
import { UserRole } from "@/types/models";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";

interface Props {
  params: { id: string };
}

export default async function RatingDetailsPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedParams = await params;

  try {
    const rating = await Rating.findByPk(resolvedParams.id, {
      include: [
        {
          model: User,
          as: "target",
          attributes: ["firstName", "lastName", "email"]
        },
        {
          model: User,
          as: "rater",
          attributes: ["firstName", "lastName", "email"],
          required: false
        },
        {
          model: QuestionRating,
          as: "questionRatings",
          include: [
            {
              model: Question,
              as: "question",
              attributes: ["question", "order"]
            }
          ]
        }
      ],
    });

    if (!rating) {
      notFound();
    }

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl">
                    Rating Details
                  </h1>
                  <p className="mt-1 text-alliance-gray-500">
                    Detailed view of the rating and feedback
                  </p>
                </div>
                <Button href="/admin/ratings" variant="secondary">
                  Back to Ratings
                </Button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Rating Overview */}
              <div className="px-6 py-5 border-b border-alliance-gray-200">
                <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                  Rating Overview
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-alliance-gray-500">Target</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900">
                      <div className="font-medium">
                        {rating.target?.firstName} {rating.target?.lastName}
                      </div>
                      <div className="text-alliance-gray-500">
                        {rating.targetRole} • {rating.target?.email}
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-alliance-gray-500">Rated By</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900">
                      <div className="font-medium">
                        {rating.rater 
                          ? `${rating.rater.firstName} ${rating.rater.lastName}`
                          : rating.raterName || "Anonymous"
                        }
                      </div>
                      <div className="text-alliance-gray-500">
                        {rating.rater?.email || rating.raterEmail || "No email"}
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-alliance-gray-500">Overall Rating</dt>
                    <dd className="mt-1 flex items-center">
                      <StarRating value={rating.score} readonly size="md" />
                      <span className="ml-2 text-lg font-medium text-alliance-gray-900">
                        {rating.score}/5
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-alliance-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900">
                      {new Date(rating.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Question Ratings */}
              {rating.questionRatings && rating.questionRatings.length > 0 && (
                <div className="px-6 py-5 border-b border-alliance-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-alliance-gray-900 mb-4">
                    Question Ratings
                  </h3>
                  <div className="space-y-4">
                    {rating.questionRatings
                      .sort((a: any, b: any) => (a.question?.order || 0) - (b.question?.order || 0))
                      .map((qr: any) => (
                      <div key={qr.id} className="bg-alliance-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-alliance-gray-900 mb-2">
                              {qr.question?.question || "Question not found"}
                            </p>
                            <div className="flex items-center">
                              <StarRating value={qr.score} readonly size="sm" />
                              <span className="ml-2 text-sm font-medium text-alliance-gray-700">
                                {qr.score}/5
                              </span>
                              <span className="ml-2 text-xs text-alliance-gray-500">
                                ({qr.score === 1 ? 'Poor' : 
                                  qr.score === 2 ? 'Fair' : 
                                  qr.score === 3 ? 'Good' : 
                                  qr.score === 4 ? 'Very Good' : 'Excellent'})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {rating.comment && (
                <div className="px-6 py-5">
                  <h3 className="text-lg leading-6 font-medium text-alliance-gray-900 mb-4">
                    Comments
                  </h3>
                  <div className="bg-alliance-gray-50 rounded-lg p-4">
                    <p className="text-sm text-alliance-gray-900 whitespace-pre-wrap">
                      {rating.comment}
                    </p>
                  </div>
                </div>
              )}

              {!rating.comment && (!rating.questionRatings || rating.questionRatings.length === 0) && (
                <div className="px-6 py-5">
                  <p className="text-alliance-gray-500 italic text-center">
                    No additional feedback provided.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching rating details:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading rating details
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading the rating details. Please try again later.
              </p>
              <div className="mt-4">
                <Button href="/admin/ratings">
                  Back to Ratings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
