"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { UserRole } from "@/types/models";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!session) {
      return [
        { href: "/", label: "Home" },
        { href: "/map", label: "Find Agent" },
      ];
    }

    const role = session.user.role as UserRole;

    if (role === UserRole.ADMIN) {
      return [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/agents", label: "Agents" },
        { href: "/admin/employees", label: "Employees" },
        { href: "/admin/callbacks", label: "Callbacks" },
        { href: "/admin/ratings", label: "Ratings" },
        { href: "/admin/complaints", label: "Complaints" },
      ];
    }

    if (role === UserRole.AGENT) {
      return [
        { href: "/agent", label: "Dashboard" },
        { href: "/agent/callbacks", label: "Callbacks" },
        { href: "/agent/ratings", label: "Ratings" },
        { href: "/agent/location", label: "Location" },
        { href: "/agent/qrcode", label: "My QR Code" },
      ];
    }

    if (role === UserRole.EMPLOYEE) {
      return [
        { href: "/employee", label: "Dashboard" },
        { href: "/employee/ratings", label: "Ratings" },
        { href: "/employee/qrcode", label: "My QR Code" },
      ];
    }

    return [
      { href: "/", label: "Home" },
      { href: "/map", label: "Find Agent" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white border-b border-alliance-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                {/* Logo placeholder */}
                <div className="h-8 w-8 bg-alliance-red-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-alliance-gray-900">
                  Alliance Insurance
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive(link.href)
                      ? "text-alliance-red-600 border-b-2 border-alliance-red-600"
                      : "text-alliance-gray-600 hover:text-alliance-gray-900 hover:border-b-2 hover:border-alliance-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center">
                <span className="text-alliance-gray-700 mr-4">
                  Hello, {session.user.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center px-3 py-1.5 border border-alliance-red-600 text-sm font-medium rounded-md text-alliance-red-600 bg-white hover:bg-alliance-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 border border-alliance-gray-300 text-sm font-medium rounded-md text-alliance-gray-700 bg-white hover:bg-alliance-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-alliance-gray-400 hover:text-alliance-gray-500 hover:bg-alliance-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive(link.href)
                  ? "border-alliance-red-600 text-alliance-red-700 bg-alliance-red-50"
                  : "border-transparent text-alliance-gray-600 hover:bg-alliance-gray-50 hover:border-alliance-gray-300 hover:text-alliance-gray-800"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-alliance-gray-200">
          {session ? (
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-alliance-gray-300 flex items-center justify-center">
                  <span className="text-alliance-gray-700 font-semibold">
                    {session.user.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-alliance-gray-800">
                  {session.user.name}
                </div>
                <div className="text-sm font-medium text-alliance-gray-500">
                  {session.user.email}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-alliance-gray-400 hover:text-alliance-gray-500"
              >
                <span className="sr-only">Sign out</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-1 px-2">
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-alliance-gray-700 hover:text-alliance-gray-900 hover:bg-alliance-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-alliance-gray-700 hover:text-alliance-gray-900 hover:bg-alliance-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
