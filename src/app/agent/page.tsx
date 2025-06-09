import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Agent, User, Callback, Rating } from "@/models";
import { Op } from "sequelize";

export default async function AgentDashboard() {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in as agent
  if (!session || session.user.role !== "agent") {
    redirect("/login");
  }

  try {
    // Fetch agent data
    const userId = session.user.id;
    const agent = await Agent.findOne({
      where: { userId },
      include: [{ model: User, as: "user" }],
    });

    if (!agent) {
      redirect("/login");
    }

    // Fetch pending callbacks
    const pendingCallbacks = await Callback.count({
      where: {
        agentId: agent.id,
        status: "pending",
      },
    });

    // Fetch scheduled callbacks
    const scheduledCallbacks = await Callback.count({
      where: {
        agentId: agent.id,
        status: "scheduled",
      },
    });

    // Fetch completed callbacks
    const completedCallbacks = await Callback.count({
      where: {
        agentId: agent.id,
        status: "completed",
      },
    });

    // Fetch latest ratings
    const ratings = await Rating.findAll({
      where: {
        targetId: userId,
        targetRole: "agent",
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Calculate rating statistics
    const totalRatings = await Rating.count({
      where: {
        targetId: userId,
        targetRole: "agent",
      },
    });

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Welcome, {agent.user.firstName}!
                </h1>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-alliance-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-alliance-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {agent.latitude && agent.longitude
                      ? "Location updated"
                      : "Location not set"}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-alliance-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-alliance-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Availability Status:
                    <span
                      className={`ml-1 font-medium ${agent.isAvailable ? "text-green-600" : "text-red-600"}`}
                    >
                      {agent.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex lg:mt-0 lg:ml-4">
                <span className="hidden sm:block ml-3">
                  <Link
                    href="/agent/location"
                    className="inline-flex items-center px-4 py-2 border border-alliance-gray-300 rounded-md shadow-sm text-sm font-medium text-alliance-gray-700 bg-white hover:bg-alliance-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alliance-red-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-alliance-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Update Location
                  </Link>
                </span>
                <span className="hidden sm:block ml-3">
                  <Link
                    href="/agent/qrcode"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-alliance-red-600 hover:bg-alliance-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alliance-red-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                        clipRule="evenodd"
                      />
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                    </svg>
                    View QR Code
                  </Link>
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Callback Stats Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-10 w-10 text-alliance-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Pending Callbacks
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {pendingCallbacks}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/agent/callbacks?status=pending"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all
                    </Link>
                  </div>
                </div>
              </div>

              {/* Scheduled Callbacks Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-10 w-10 text-alliance-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Scheduled Callbacks
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {scheduledCallbacks}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/agent/callbacks?status=scheduled"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all
                    </Link>
                  </div>
                </div>
              </div>

              {/* Ratings Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-10 w-10 text-alliance-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Rating Score
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {agent.averageRating
                              ? agent.averageRating.toFixed(1)
                              : "N/A"}{" "}
                            ({totalRatings})
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/agent/ratings"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all ratings
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-alliance-gray-900">
                Recent Ratings
              </h2>
              <div className="mt-4">
                {ratings.length > 0 ? (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-alliance-gray-300">
                      <thead className="bg-alliance-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                          >
                            From
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                          >
                            Rating
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                          >
                            Comment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-alliance-gray-200 bg-white">
                        {ratings.map((rating) => (
                          <tr key={rating.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-alliance-gray-900 sm:pl-6">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                              {rating.raterName || "Anonymous"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-alliance-red-100 text-alliance-red-800">
                                {rating.score}/5
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-alliance-gray-500 max-w-xs truncate">
                              {rating.comment || "No comment"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-lg shadow">
                    <p className="text-alliance-gray-500">
                      No ratings received yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Callbacks Section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-alliance-gray-900">
                Recent Activity
              </h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-alliance-gray-200">
                  {pendingCallbacks > 0 && (
                    <li>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-alliance-red-600 truncate">
                            Pending Callbacks
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-alliance-red-100 text-alliance-red-800">
                              {pendingCallbacks} new
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-alliance-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-alliance-gray-400"
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
                              You have {pendingCallbacks} pending callback
                              requests
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-alliance-gray-500 sm:mt-0">
                            <Link
                              href="/agent/callbacks?status=pending"
                              className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                            >
                              View callbacks
                              <span aria-hidden="true"> &rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}

                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-alliance-red-600 truncate">
                          Share Your QR Code
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-alliance-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-alliance-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                                clipRule="evenodd"
                              />
                              <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                            </svg>
                            Share your QR code to collect ratings from clients
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-alliance-gray-500 sm:mt-0">
                          <Link
                            href="/agent/qrcode"
                            className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                          >
                            View QR code
                            <span aria-hidden="true"> &rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching agent dashboard data:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading dashboard
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading your dashboard. Please try again
                later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
