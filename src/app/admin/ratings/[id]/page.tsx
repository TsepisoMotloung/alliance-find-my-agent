
import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Rating, User, QuestionRating, Question } from "@/models";
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

  const { id } = await params;

  try {
    const rating = await Rating.findByPk(id, {
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
              attributes: ["id", "question", "order"]
            }
          ]
        }
      ],
    });

    if (!rating) {
      notFound();
    }

    const questionRatings = rating.questionRatings || [];
    const sortedQuestionRatings = questionRatings.sort((a, b) => 
      (a.question?.order || 0) - (b.question?.order || 0)
    );

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
                <div className="flex space-x-3">
                  <Button href="/admin/ratings" variant="secondary">
                    Back to Ratings
                  </Button>
                  <Button href={`/admin/ratings/${rating.id}/edit`} variant="primary">
                    Edit Rating
                  </Button>
                  <Button href={`/admin/ratings/${rating.id}/delete`} variant="danger">
                    Delete Rating
                  </Button>
                </div>
              </div>
            </div>

            {/* Rating Overview */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-6 py-4 border-b border-alliance-gray-200">
                <h2 className="text-lg font-medium text-alliance-gray-900">Rating Overview</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-alliance-gray-500 mb-2">Target</h3>
                    <div className="text-sm text-alliance-gray-900">
                      <div className="font-medium">
                        {rating.target?.firstName} {rating.target?.lastName}
                      </div>
                      <div className="text-alliance-gray-500">
                        {rating.targetRole} • {rating.target?.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-alliance-gray-500 mb-2">Rated By</h3>
                    <div className="text-sm text-alliance-gray-900">
                      <div className="font-medium">
                        {rating.rater 
                          ? `${rating.rater.firstName} ${rating.rater.lastName}`
                          : rating.raterName || "Anonymous"
                        }
                      </div>
                      <div className="text-alliance-gray-500">
                        {rating.rater?.email || rating.raterEmail || "No email provided"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-alliance-gray-500 mb-2">Overall Rating</h3>
                    <div className="flex items-center">
                      <StarRating value={rating.score} readonly size="md" />
                      <span className="ml-2 text-lg font-medium text-alliance-gray-900">
                        {rating.score}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-alliance-gray-500 mb-2">Date</h3>
                    <div className="text-sm text-alliance-gray-900">
                      <div>{new Date(rating.createdAt).toLocaleDateString()}</div>
                      <div className="text-alliance-gray-500">
                        {new Date(rating.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Ratings */}
            {sortedQuestionRatings.length > 0 && (
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-6 py-4 border-b border-alliance-gray-200">
                  <h2 className="text-lg font-medium text-alliance-gray-900">Question-Specific Ratings</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {sortedQuestionRatings.map((qr) => (
                      <div key={qr.id} className="border border-alliance-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-alliance-gray-900 mb-2">
                              {qr.question?.question}
                            </h4>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="flex items-center">
                              <StarRating value={qr.score} readonly size="sm" />
                              <span className="ml-2 text-sm font-medium text-alliance-gray-900">
                                {qr.score}/5
                              </span>
                            </div>
                            <div className="text-xs text-alliance-gray-500 mt-1">
                              {qr.score === 1 && 'Poor'}
                              {qr.score === 2 && 'Fair'}
                              {qr.score === 3 && 'Good'}
                              {qr.score === 4 && 'Very Good'}
                              {qr.score === 5 && 'Excellent'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Comments and Feedback */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-alliance-gray-200">
                <h2 className="text-lg font-medium text-alliance-gray-900">Comments and Feedback</h2>
              </div>
              <div className="px-6 py-4">
                {rating.comment ? (
                  <div className="prose prose-sm max-w-none">
                    {rating.comment.split('\n\n').map((section, index) => (
                      <div key={index} className="mb-4 p-4 bg-alliance-gray-50 rounded-lg">
                        {section.includes(':') ? (
                          <div>
                            <h4 className="font-medium text-alliance-gray-900 mb-2">
                              {section.split(':')[0]}:
                            </h4>
                            <p className="text-alliance-gray-700 whitespace-pre-wrap">
                              {section.split(':').slice(1).join(':').trim()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-alliance-gray-700 whitespace-pre-wrap">
                            {section}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-alliance-gray-500 italic">
                      No additional comments provided
                    </p>
                  </div>
                )}
              </div>
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
