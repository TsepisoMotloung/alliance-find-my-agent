import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-alliance-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              {/* Logo placeholder */}
              <div className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="ml-2 text-xl font-semibold text-alliance-gray-900">
                Alliance Insurance
              </span>
            </div>
            <p className="mt-4 text-alliance-gray-600 max-w-md">
              Your trusted partner for all insurance needs. Find our agents
              easily, get assistance, and manage your policies with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-alliance-gray-900 font-medium mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-alliance-gray-600 hover:text-alliance-red-600"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-alliance-gray-600 hover:text-alliance-red-600"
                >
                  Find an Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/rate/scan"
                  className="text-alliance-gray-600 hover:text-alliance-red-600"
                >
                  Scan QR Code
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-alliance-gray-900 font-medium mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="text-alliance-gray-600">
                <span className="font-medium">Email:</span> info@alliance.co.ls
              </li>
              <li className="text-alliance-gray-600">
                <span className="font-medium">Phone:</span>
              </li>
              <li className="text-alliance-gray-600">
                <span className="font-medium">Address:</span> Maseru, Lesotho
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-alliance-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-alliance-gray-500 text-sm">
            &copy; {currentYear} Alliance Insurance. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              href="/privacy"
              className="text-alliance-gray-500 hover:text-alliance-gray-700 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-alliance-gray-500 hover:text-alliance-gray-700 text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-alliance-gray-500 hover:text-alliance-gray-700 text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
