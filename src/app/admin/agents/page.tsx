import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Agent, User } from "@/models";
import { UserRole, ApprovalStatus } from "@/types/models";
import { Op } from "sequelize";

interface SearchParams {
  page?: string;
  search?: string;
  available?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function AdminAgentsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = resolvedSearchParams.search || "";
  const availableFilter = resolvedSearchParams.available || "";

  try {
    const whereClause: any = {};
    const userWhereClause: any = {};

    if (search) {
      userWhereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (availableFilter) {
      whereClause.isAvailable = availableFilter === "true";
    }

    const { count, rows: agents } = await Agent.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: "user",
        where: userWhereClause
      }],
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
                  Manage Agents
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View and manage all insurance agents
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Name, email, or license"
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Availability
                  </label>
                  <select
                    name="available"
                    defaultValue={availableFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All</option>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
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

            {/* Agents Table */}
            <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-alliance-gray-300">
                <thead className="bg-alliance-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6">
                      Agent
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      License Number
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Specialization
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Rating
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Availability
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Location
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-alliance-gray-200 bg-white">
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-alliance-gray-900 sm:pl-6">
                        <div>
                          <div className="font-medium">
                            {agent.user.firstName} {agent.user.lastName}
                          </div>
                          <div className="text-alliance-gray-500">{agent.user.email}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {agent.licenseNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {agent.specialization || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {agent.averageRating ? agent.averageRating.toFixed(1) : "No ratings"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            agent.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {agent.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {agent.latitude && agent.longitude ? (
                          <span className="text-green-600">Set</span>
                        ) : (
                          <span className="text-red-600">Not set</span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/admin/agents/${agent.id}`}
                          className="text-alliance-red-600 hover:text-alliance-red-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/users/${agent.userId}`}
                          className="text-alliance-red-600 hover:text-alliance-red-900"
                        >
                          Edit User
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/agents?page=${page - 1}&search=${search}&available=${availableFilter}`}
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
                      href={`/admin/agents?page=${page + 1}&search=${search}&available=${availableFilter}`}
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
    console.error("Error fetching agents:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading agents
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading agents. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}