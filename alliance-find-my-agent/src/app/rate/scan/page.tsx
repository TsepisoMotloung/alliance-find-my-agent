import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import ScanClient from "./ScanClient";

export default function ScanPage() {
  return (
    <MainLayout>
      <div className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-alliance-gray-900 sm:text-4xl">
              Scan Agent QR Code
            </h1>
            <p className="mt-3 text-xl text-alliance-gray-500">
              Scan an agent's QR code to rate their service or request a
              callback
            </p>
          </div>

          <ScanClient />
        </div>
      </div>
    </MainLayout>
  );
}
