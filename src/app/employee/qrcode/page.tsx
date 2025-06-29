import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { generateRatingQRCode } from "@/lib/qrcode";
import { Employee, User } from "@/models";
import QRCodeDisplay from "@/app/agent/qrcode/QRCodeDisplay"; // Reuse the QR code display component

export default async function EmployeeQRCodePage() {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in as employee
  if (!session || session.user.role !== "employee") {
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

    // Generate QR code
    const qrCode = await generateRatingQRCode(userId, "employee");
    const fullName = `${employee.user.firstName} ${employee.user.lastName}`;

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-alliance-gray-900 sm:text-4xl">
                Your Rating QR Code
              </h1>
              <p className="mt-3 text-xl text-alliance-gray-500">
                Share this QR code with clients to collect ratings and feedback
              </p>
            </div>

            <QRCodeDisplay
              qrCode={qrCode}
              name={fullName}
              title={`${employee.department} - ${employee.position}`}
              agentId={userId}
            />

            <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                  How to Use Your QR Code
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-alliance-gray-500">
                  Instructions for sharing your QR code with clients
                </p>
              </div>
              <div className="border-t border-alliance-gray-200">
                <dl>
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">
                      Print Physical Copy
                    </dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      Print and display the QR code at your desk or office.
                      Clients can scan it using their smartphone camera.
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">
                      Digital Business Card
                    </dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      Include the QR code in your digital business card or email
                      signature for easy access.
                    </dd>
                  </div>
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">
                      After Client Interactions
                    </dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      After assisting clients, ask them to scan the QR code to
                      provide feedback on your service.
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">
                      Customer Service Areas
                    </dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      Place the QR code in customer service areas where clients
                      can easily scan it after receiving assistance.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error generating QR code:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error Generating QR Code
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while generating your QR code. Please try
                again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
