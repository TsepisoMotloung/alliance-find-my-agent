import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Callback, Agent, User } from "@/models";
import { UserRole } from "@/types/models";
import { Op } from "sequelize";

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function AdminCallbacksPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = resolvedSearchParams.search || "";
  const statusFilter = resolvedSearchParams.status || "";
  const agentFilter = resolvedSearchParams.agent || "";

  try {
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { clientName: { [Op.like]: `%${search}%` } },
        { clientEmail: { [Op.like]: `%${search}%` } },
        { clientPhone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const { count, rows: callbacks } = await Callback.findAndCountAll({
      where: whereClause,
      include: [{
        model: Agent,
        as: "agent",
        include: [{
          model: User,
          as: "user"
        }]
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
                  Manage Callbacks
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View and manage all callback requests
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
                    placeholder="Client name, email, or phone"
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={statusFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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

            {/* Callbacks Table */}
            <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-alliance-gray-300">
                <thead className="bg-alliance-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6">
                      Client
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Agent
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Purpose
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Requested
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Scheduled
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-alliance-gray-200 bg-white">
                  {callbacks.map((callback) => (
                    <tr key={callback.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-alliance-gray-900 sm:pl-6">
                        <div>
                          <div className="font-medium">{callback.clientName}</div>
                          <div className="text-alliance-gray-500">{callback.clientEmail}</div>
                          <div className="text-alliance-gray-500">{callback.clientPhone}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {callback.agent?.user?.firstName} {callback.agent?.user?.lastName}
                      </td>
                      <td className="px-3 py-4 text-sm text-alliance-gray-500">
                        <div className="max-w-xs truncate">
                          {callback.purpose}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            callback.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : callback.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : callback.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {callback.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {new Date(callback.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {callback.scheduledAt 
                          ? new Date(callback.scheduledAt).toLocaleDateString()
                          : "Not scheduled"
                        }
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/admin/callbacks/${callback.id}`}
                          className="text-alliance-red-600 hover:text-alliance-red-900"
                        >
                          View Details
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
                      href={`/admin/callbacks?page=${page - 1}&search=${search}&status=${statusFilter}`}
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
                      href={`/admin/callbacks?page=${page + 1}&search=${search}&status=${statusFilter}`}
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
    console.error("Error fetching callbacks:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading callbacks
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading callbacks. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}