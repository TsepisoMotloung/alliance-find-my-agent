import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Rating, User } from "@/models";
import { UserRole } from "@/types/models";
import { Op } from "sequelize";
import StarRating from "@/components/ui/StarRating";

interface SearchParams {
  page?: string;
  search?: string;
  targetRole?: string;
  score?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function AdminRatingsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = resolvedSearchParams.search || "";
  const targetRoleFilter = resolvedSearchParams.targetRole || "";
  const scoreFilter = resolvedSearchParams.score || "";

  try {
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { raterName: { [Op.like]: `%${search}%` } },
        { raterEmail: { [Op.like]: `%${search}%` } },
        { comment: { [Op.like]: `%${search}%` } }
      ];
    }

    if (targetRoleFilter) {
      whereClause.targetRole = targetRoleFilter;
    }

    if (scoreFilter) {
      whereClause.score = parseInt(scoreFilter);
    }

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereClause,
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
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Manage Ratings
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View and manage all ratings and feedback
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Rater name, email, or comment"
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Target Role
                  </label>
                  <select
                    name="targetRole"
                    defaultValue={targetRoleFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All Roles</option>
                    <option value="agent">Agents</option>
                    <option value="employee">Employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Score
                  </label>
                  <select
                    name="score"
                    defaultValue={scoreFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All Scores</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                  >
                    Filter
                  </button>
                </div>
              </form>
            </div>

            {/* Ratings Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-alliance-gray-200">
                  <thead className="bg-alliance-gray-50 sticky top-0">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6">
                        Target
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                        Rated By
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                        Rating
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900 min-w-96">
                        Comment/Feedback
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                        Date
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-alliance-gray-200 bg-white">
                    {ratings.map((rating) => (
                      <tr key={rating.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-alliance-gray-900 sm:pl-6">
                          <div>
                            <div className="font-medium">
                              {rating.target?.firstName} {rating.target?.lastName}
                            </div>
                            <div className="text-alliance-gray-500 text-xs">
                              {rating.targetRole} • {rating.target?.email}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                          <div>
                            <div className="font-medium">
                              {rating.rater 
                                ? `${rating.rater.firstName} ${rating.rater.lastName}`
                                : rating.raterName || "Anonymous"
                              }
                            </div>
                            <div className="text-alliance-gray-500 text-xs">
                              {rating.rater?.email || rating.raterEmail || "No email"}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                          <div className="flex items-center">
                            <StarRating value={rating.score} readonly size="sm" />
                            <span className="ml-2 text-sm font-medium">
                              {rating.score}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-alliance-gray-500 max-w-96">
                          {rating.comment ? (
                            <div className="whitespace-pre-wrap break-words">
                              {rating.comment.split('\n\n').map((section, index) => (
                                <div key={index} className="mb-2">
                                  {section.includes(':') ? (
                                    <div>
                                      <span className="font-medium text-alliance-gray-700">
                                        {section.split(':')[0]}:
                                      </span>
                                      <span className="ml-1">
                                        {section.split(':').slice(1).join(':')}
                                      </span>
                                    </div>
                                  ) : (
                                    <div>{section}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-alliance-gray-400 italic">
                              No comment
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                          <div>
                            <div>{new Date(rating.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-alliance-gray-400">
                              {new Date(rating.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex flex-col space-y-1">
                            <Link
                              href={`/admin/ratings/${rating.id}`}
                              className="text-alliance-red-600 hover:text-alliance-red-900"
                            >
                              View Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/ratings?page=${page - 1}&search=${search}&targetRole=${targetRoleFilter}&score=${scoreFilter}`}
                      className="px-3 py-2 rounded-md bg-white border border-alliance-gray-300 text-alliance-gray-700 hover:bg-alliance-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-3 py-2 rounded-md bg-alliance-red-600 text-white">
                    {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/admin/ratings?page=${page + 1}&search=${search}&targetRole=${targetRoleFilter}&score=${scoreFilter}`}
                      className="px-3 py-2 rounded-md bg-white border border-alliance-gray-300 text-alliance-gray-700 hover:bg-alliance-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading ratings
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading ratings. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}