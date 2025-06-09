import React from "react";
import { notFound } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import RatingForm from "@/components/forms/RatingForm";
import { User, Employee } from "@/models";
import Button from "@/components/ui/Button";

interface RateEmployeePageProps {
  params: {
    id: string;
  };
}

export default async function RateEmployeePage({
  params,
}: RateEmployeePageProps) {
  const { id } = params;

  try {
    // Fetch employee details
    const user = await User.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employee",
        },
      ],
    });

    // If user not found or not an employee or not approved, return 404
    if (
      !user ||
      !user.employee ||
      user.approvalStatus !== "approved" ||
      !user.isActive
    ) {
      notFound();
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-alliance-gray-900 sm:text-4xl">
                Rate Your Experience
              </h1>
              <p className="mt-3 text-xl text-alliance-gray-500">
                Share your feedback about your experience with this employee
              </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-alliance-gray-200">
                <h2 className="text-lg font-medium text-alliance-gray-900">
                  Employee Details
                </h2>
                <div className="mt-2 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-alliance-red-100 flex items-center justify-center">
                    <span className="text-alliance-red-600 font-semibold text-lg">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-alliance-gray-900">
                      {fullName}
                    </p>
                    <p className="text-sm text-alliance-gray-500">
                      {user.employee.department} - {user.employee.position}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <RatingForm
                  targetId={id}
                  targetRole="employee"
                  targetName={fullName}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button href="/" variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching employee:", error);
    notFound();
  }
}
