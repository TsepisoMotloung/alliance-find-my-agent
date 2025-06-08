'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface SearchResult {
  id: string;
  role: 'agent' | 'employee';
  firstName: string;
  lastName: string;
  licenseNumber?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  specialization?: string;
  averageRating?: number;
}

const SearchForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Make API request to search for agents/employees
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Search failed. Please try again.');
      }
      
      const data = await response.json();
      
      if (data.results.length === 0) {
        setSearchError('No results found. Try a different search term.');
        setSearchResults([]);
      } else {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRateClick = (result: SearchResult) => {
    router.push(`/rate/${result.role}/${result.id}`);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Search by name, license number, or employee ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        {searchError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {searchError}
          </div>
        )}
      </form>
      
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
            Search Results
          </h3>
          
          <div className="bg-alliance-gray-50 rounded-lg divide-y divide-alliance-gray-200">
            {searchResults.map((result) => (
              <div key={result.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-alliance-gray-900">
                      {result.firstName} {result.lastName}
                    </h4>
                    <p className="text-sm text-alliance-gray-500">
                      {result.role === 'agent' ? (
                        <>Insurance Agent {result.specialization && `• ${result.specialization}`}</>
                      ) : (
                        <>{result.department} • {result.position}</>
                      )}
                    </p>
                    {result.averageRating ? (
                      <div className="mt-1 flex items-center">
                        <StarRating value={result.averageRating} readonly size="sm" />
                        <span className="ml-2 text-sm text-alliance-gray-600">
                          {result.averageRating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-alliance-gray-500">
                        No ratings yet
                      </p>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <Button
                      onClick={() => handleRateClick(result)}
                      size="sm"
                    >
                      Rate {result.role === 'agent' ? 'Agent' : 'Employee'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;