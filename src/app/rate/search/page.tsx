import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import SearchForm from './SearchForm';

export default function RateSearchPage() {
  return (
    <MainLayout>
      <div className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-alliance-gray-900 sm:text-4xl">
              Search for Agent or Employee
            </h1>
            <p className="mt-3 text-xl text-alliance-gray-500">
              Find the Alliance Insurance representative you'd like to rate
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-alliance-gray-200">
              <h2 className="text-lg font-medium text-alliance-gray-900">Search</h2>
              <p className="mt-1 text-sm text-alliance-gray-500">
                Enter a name, license number, or employee ID to find the person you want to rate
              </p>
            </div>
            
            <div className="p-6">
              <SearchForm />
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-alliance-gray-600">
              Alternatively, if you have a QR code, you can <a href="/rate/scan" className="text-alliance-red-600 hover:text-alliance-red-500">scan it here</a>.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}