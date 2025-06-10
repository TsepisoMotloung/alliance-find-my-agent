import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { User } from "@/models";
import { UserRole, ApprovalStatus } from "@/types/models";
import { Op } from "sequelize";

interface SearchParams {
  page?: string;
  search?: string;
  role?: string;
  approvalStatus?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = resolvedSearchParams.search || "";
  const roleFilter = resolvedSearchParams.role || "";
  const statusFilter = resolvedSearchParams.approvalStatus || "";

  try {
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (roleFilter) {
      whereClause.role = roleFilter;
    }

    if (statusFilter) {
      whereClause.approvalStatus = statusFilter;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
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
                  Manage Users
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View, edit, and manage all users in the system
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                >
                  Add New User
                </Link>
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
                    placeholder="Name or email"
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={roleFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All Roles</option>
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Status
                  </label>
                  <select
                    name="approvalStatus"
                    defaultValue={statusFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(ApprovalStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
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

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-alliance-gray-200">
                <thead className="bg-alliance-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Role
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Joined
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-alliance-gray-200 bg-white">
                  {users.map((user) => (
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
                          className="text-alliance-red-600 hover:text-alliance-red-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/delete`}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Link>
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
                      href={`/admin/users?page=${page - 1}&search=${search}&role=${roleFilter}&approvalStatus=${statusFilter}`}
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
                      href={`/admin/users?page=${page + 1}&search=${search}&role=${roleFilter}&approvalStatus=${statusFilter}`}
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
    console.error("Error fetching users:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading users
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading users. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}