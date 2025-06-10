
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Rating, User } from "@/models";
import { UserRole } from "@/types/models";
import EditRatingForm from "@/components/forms/EditRatingForm";

interface Props {
  params: { id: string };
}

export default async function EditRatingPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const { id } = await params;

  try {
    const rating = await Rating.findByPk(id, {
      include: [
        {
          model: User,
          as: "target",
          attributes: ["firstName", "lastName", "email"]
        }
      ],
    });

    if (!rating) {
      notFound();
    }

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl">
                Edit Rating
              </h1>
              <p className="mt-1 text-alliance-gray-500">
                Update rating for {rating.target?.firstName} {rating.target?.lastName}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4">
                <EditRatingForm rating={rating} />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error fetching rating:", error);
    notFound();
  }
}
