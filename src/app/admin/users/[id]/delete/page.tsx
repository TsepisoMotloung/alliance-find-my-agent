
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { User } from "@/models";
import { UserRole } from "@/types/models";
import DeleteUserForm from "@/components/forms/DeleteUserForm";

interface Props {
  params: { id: string };
}

export default async function DeleteUserPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const { id } = await params;

  try {
    const user = await User.findByPk(id, {
      attributes: ["id", "firstName", "lastName", "email", "role"]
    });

    if (!user) {
      notFound();
    }

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl">
                Delete User
              </h1>
              <p className="mt-1 text-alliance-gray-500">
                Permanently remove this user account
              </p>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4">
                <DeleteUserForm user={user} />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    notFound();
  }
}
