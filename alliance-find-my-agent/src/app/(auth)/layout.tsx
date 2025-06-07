import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-alliance-gray-50 min-h-screen">{children}</div>;
}
