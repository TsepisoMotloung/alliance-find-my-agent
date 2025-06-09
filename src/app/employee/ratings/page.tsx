import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { Employee, User, Rating } from '@/models';
import { UserRole } from '@/types/models';
import StarRating from '@/components/ui/StarRating';

export default async function EmployeeRatingsPage() {
  // Get the user's session
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in as employee
  if (!session || session.user.role !== UserRole.EMPLOYEE) {
    redirect('/login');
  }
  
  try {
    // Fetch employee data
    const userId = session.user.id;
    const employee = await Employee.findOne({
      where: { userId },
      include: [{ model: User, as: 'user' }],
    });
    
    if (!employee) {
      redirect('/login');
    }
    
    // Fetch ratings
    const ratings = await Rating.findAll({
      where: {
        targetId: userId,
        targetRole: 'employee',
      },
      order: [['createdAt', 'DESC']],
    });
    
    // Calculate statistics
    const totalRatings = ratings.length;
    let averageRating = 0;
    let ratingDistribution = [0, 0, 0, 0, 0]; // For 1-5 stars
    
    if (totalRatings > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
      averageRating = sum / totalRatings;
      
      // Calculate distribution
      ratings.forEach(rating => {
        ratingDistribution[rating.score - 1]++;
      });
    }
    
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  My Ratings & Feedback
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View ratings and feedback from clients
                </p>
              </div>
            </div>

            {/* Rating Statistics */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-alliance-gray-200">
                <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">Rating Summary</h3>
                <p className="mt-1 max-w-2xl text-sm text-alliance-gray-500">
                  Overview of your performance ratings
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Average Rating */}
                  <div className="bg-alliance-gray-50 p-4 rounded-lg text-center">
                    <div className="text-4xl font-bold text-alliance-gray-900">
                      {averageRating ? averageRating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="mt-2 flex justify-center">
                      <StarRating value={averageRating} readonly size="md" />
                    </div>
                    <div className="mt-2 text-sm text-alliance-gray-500">
                      Average Rating
                    </div>
                  </div>
                  
                  {/* Total Ratings */}
                  <div className="bg-alliance-gray-50 p-4 rounded-lg text-center">
                    <div className="text-4xl font-bold text-alliance-gray-900">
                      {totalRatings}
                    </div>
                    <div className="mt-2 text-sm text-alliance-gray-500">
                      Total Ratings
                    </div>
                  </div>
                  
                  {/* Latest Rating */}
                  <div className="bg-alliance-gray-50 p-4 rounded-lg text-center">
                    <div className="text-4xl font-bold text-alliance-gray-900">
                      {ratings.length > 0 ? ratings[0].score : 'N/A'}
                    </div>
                    <div className="mt-2 flex justify-center">
                      {ratings.length > 0 && (
                        <StarRating value={ratings[0].score} readonly size="md" />
                      )}
                    </div>
                    <div className="mt-2 text-sm text-alliance-gray-500">
                      Latest Rating
                    </div>
                  </div>
                </div>
                
                {/* Rating Distribution */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-alliance-gray-900 mb-3">Rating Distribution</h4>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDistribution[star - 1];
                    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center mb-2">
                        <div className="w-16 text-sm text-alliance-gray-700">{star} stars</div>
                        <div className="flex-1 h-4 mx-2 bg-alliance-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-alliance-red-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-sm text-alliance-gray-700">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ratings List */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-alliance-gray-900 mb-4">
                All Ratings
              </h2>
              
              {ratings.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  {ratings.map((rating, index) => (
                    <div 
                      key={rating.id}
                      className={`px-4 py-5 sm:p-6 ${
                        index < ratings.length - 1 ? 'border-b border-alliance-gray-200' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start">
                        <div className="md:w-1/4 mb-4 md:mb-0">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-alliance-red-100 flex items-center justify-center">
                              <span className="text-alliance-red-600 font-medium">
                                {rating.raterName ? rating.raterName.charAt(0) : 'A'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-alliance-gray-900">
                                {rating.raterName || 'Anonymous'}
                              </p>
                              <p className="text-xs text-alliance-gray-500">
                                {new Date(rating.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-3/4">
                          <div className="flex items-center mb-2">
                            <StarRating value={rating.score} readonly size="sm" />
                            <span className="ml-2 text-sm text-alliance-gray-700">
                              {rating.score}/5
                            </span>
                          </div>
                          
                          {rating.comment && (
                            <div className="text-sm text-alliance-gray-700 bg-alliance-gray-50 p-3 rounded-md">
                              {rating.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-alliance-gray-500">
                    You haven't received any ratings yet. Share your QR code with clients to collect feedback.
                  </p>
                  <div className="mt-4">
                    <a 
                      href="/employee/qrcode" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                    >
                      View My QR Code
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error Loading Ratings
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading your ratings. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}