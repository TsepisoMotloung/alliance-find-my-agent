import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Employee, User, Rating } from "@/models";
import { UserRole } from "@/types/models";

export default async function EmployeeDashboard() {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in as employee
  if (!session || session.user.role !== UserRole.EMPLOYEE) {
    redirect("/login");
  }

  try {
    // Fetch employee data
    const userId = session.user.id;
    const employee = await Employee.findOne({
      where: { userId },
      include: [{ model: User, as: "user" }],
    });

    if (!employee) {
      redirect("/login");
    }

    // Fetch latest ratings
    const ratings = await Rating.findAll({
      where: {
        targetId: userId,
        targetRole: "employee",
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Calculate rating statistics
    const totalRatings = await Rating.count({
      where: {
        targetId: userId,
        targetRole: "employee",
      },
    });

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Welcome, {employee.user.firstName}!
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
                        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    {employee.department} Department
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
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {employee.position}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex lg:mt-0 lg:ml-4">
                <span className="hidden sm:block">
                  <Link
                    href="/employee/qrcode"
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
                            {employee.averageRating
                              ? employee.averageRating.toFixed(1)
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
                      href="/employee/ratings"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all ratings
                    </Link>
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
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
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Your QR Code
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            Share for Ratings
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/employee/qrcode"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View QR code
                    </Link>
                  </div>
                </div>
              </div>

              {/* Profile Card */}
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
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Your Profile
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            Employee #{employee.employeeId}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/employee/profile"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Ratings Section */}
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

            {/* Quick Actions Section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-alliance-gray-900">
                Quick Actions
              </h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-alliance-gray-200">
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
                            href="/employee/qrcode"
                            className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                          >
                            View QR code
                            <span aria-hidden="true"> &rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-alliance-red-600 truncate">
                          Update Your Profile
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
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Keep your profile information up to date
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-alliance-gray-500 sm:mt-0">
                          <Link
                            href="/employee/profile"
                            className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                          >
                            Edit profile
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
    console.error("Error fetching employee dashboard data:", error);
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
