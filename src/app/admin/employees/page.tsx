
import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Employee, User } from "@/models";
import { UserRole } from "@/types/models";
import { Op } from "sequelize";

interface SearchParams {
  page?: string;
  search?: string;
  department?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function AdminEmployeesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = searchParams.search || "";
  const departmentFilter = searchParams.department || "";

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
    
    if (departmentFilter) {
      whereClause.department = departmentFilter;
    }

    const { count, rows: employees } = await Employee.findAndCountAll({
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

    // Get unique departments for filter
    const departments = await Employee.findAll({
      attributes: ["department"],
      group: ["department"],
      raw: true
    });

    const totalPages = Math.ceil(count / limit);

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Manage Employees
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View and manage all company employees
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
                    placeholder="Name, email, or employee ID"
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-alliance-gray-700">
                    Department
                  </label>
                  <select
                    name="department"
                    defaultValue={departmentFilter}
                    className="mt-1 block w-full rounded-md border-alliance-gray-300 shadow-sm focus:border-alliance-red-500 focus:ring-alliance-red-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.department} value={dept.department}>
                        {dept.department}
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

            {/* Employees Table */}
            <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-alliance-gray-300">
                <thead className="bg-alliance-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-alliance-gray-900 sm:pl-6">
                      Employee
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Employee ID
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Department
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Position
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-alliance-gray-900">
                      Rating
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
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-alliance-gray-900 sm:pl-6">
                        <div>
                          <div className="font-medium">
                            {employee.user.firstName} {employee.user.lastName}
                          </div>
                          <div className="text-alliance-gray-500">{employee.user.email}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {employee.employeeId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {employee.department}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {employee.position}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {employee.averageRating ? employee.averageRating.toFixed(1) : "No ratings"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-alliance-gray-500">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/admin/employees/${employee.id}`}
                          className="text-alliance-red-600 hover:text-alliance-red-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/users/${employee.userId}`}
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
                      href={`/admin/employees?page=${page - 1}&search=${search}&department=${departmentFilter}`}
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
                      href={`/admin/employees?page=${page + 1}&search=${search}&department=${departmentFilter}`}
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
    console.error("Error fetching employees:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error loading employees
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading employees. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
