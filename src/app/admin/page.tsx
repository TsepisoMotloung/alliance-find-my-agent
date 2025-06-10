import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { User, Agent, Employee, Callback, Rating, Complaint } from "@/models";
import { UserRole, ApprovalStatus } from "@/types/models";

export default async function AdminDashboard() {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in as admin
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  try {
    // Fetch dashboard statistics
    const [
      totalUsers,
      pendingApprovals,
      totalAgents,
      totalEmployees,
      pendingCallbacks,
      totalRatings,
      totalComplaints,
    ] = await Promise.all([
      User.count(),
      User.count({
        where: { approvalStatus: ApprovalStatus.PENDING },
      }),
      Agent.count(),
      Employee.count(),
      Callback.count({
        where: { status: "pending" },
      }),
      Rating.count(),
      Complaint.count(),
    ]);

    // Fetch recent users
    const recentUsers = await User.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "approvalStatus",
        "createdAt",
      ],
    });

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  Manage users, agents, employees, and monitor system activity
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-alliance-red-600 hover:bg-alliance-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alliance-red-500"
                >
                  Add New User
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Users Card */}
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Total Users
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {totalUsers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/users"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all users
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Card */}
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Pending Approvals
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {pendingApprovals}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/users?approvalStatus=pending"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View pending approvals
                    </Link>
                  </div>
                </div>
              </div>

              {/* Agents Card */}
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Total Agents
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {totalAgents}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/agents"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all agents
                    </Link>
                  </div>
                </div>
              </div>

              {/* Employees Card */}
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
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Total Employees
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {totalEmployees}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/employees"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all employees
                    </Link>
                  </div>
                </div>
              </div>

              {/* Callbacks Card */}
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
                      href="/admin/callbacks"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all callbacks
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
                          Total Ratings
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {totalRatings}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/ratings"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all ratings
                    </Link>
                  </div>
                </div>
              </div>

              {/* Complaints Card */}
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Total Complaints
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            {totalComplaints}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/complaints"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      View all complaints
                    </Link>
                  </div>
                </div>
              </div>

              {/* Questions Card */}
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
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-alliance-gray-500 truncate">
                          Rating Questions
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-alliance-gray-900">
                            Manage
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-alliance-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/admin/questions"
                      className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
                    >
                      Manage questions
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-alliance-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link
                  href="/admin/users"
                  className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-alliance-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-alliance-gray-900">
                      Manage Users
                    </h3>
                  </div>
                </Link>
                <Link
                  href="/admin/agents"
                  className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-alliance-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-alliance-gray-900">
                      Manage Agents
                    </h3>
                  </div>
                </Link>
                <Link
                  href="/admin/employees"
                  className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-alliance-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-alliance-gray-900">
                      Manage Employees
                    </h3>
                  </div>
                </Link>
                <Link
                  href="/admin/questions"
                  className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-alliance-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-alliance-gray-900">
                      Rating Questions
                    </h3>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Users Section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-alliance-gray-900">
                Recent Users
              </h2>
              <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-alliance-gray-300">
                  <thead className="bg-alliance-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900"
                      >
                        Joined
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-alliance-gray-200 bg-white">
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-alliance-gray-900 sm:pl-6">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-alliance-gray-100 text-alliance-gray-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.approvalStatus === ApprovalStatus.APPROVED
                                ? "bg-green-100 text-green-800"
                                : user.approvalStatus === ApprovalStatus.PENDING
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.approvalStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-alliance-red-600 hover:text-alliance-red-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-alliance-red-600 hover:text-alliance-red-500"
                >
                  View all users
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
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
