
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface Question {
  id: string;
  question: string;
  order: number;
}

interface RatingFormProps {
  targetId: string;
  targetRole: 'agent' | 'employee';
  targetName: string;
  onSuccess?: () => void;
}

interface FormValues {
  raterName: string;
  raterEmail: string;
  comment: string;
  isComplaint: boolean;
}

interface QuestionRating {
  questionId: string;
  rating: number;
  question: string;
}

const RatingForm: React.FC<RatingFormProps> = ({
  targetId,
  targetRole,
  targetName,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionRatings, setQuestionRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const watchComment = watch('comment');
  const watchIsComplaint = watch('isComplaint');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions?targetRole=${targetRole}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions || []);
          // Initialize ratings to 0 for all questions
          const initialRatings: Record<string, number> = {};
          data.questions?.forEach((question: Question) => {
            initialRatings[question.id] = 0;
          });
          setQuestionRatings(initialRatings);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [targetRole]);

  const handleQuestionRating = (questionId: string, rating: number) => {
    setQuestionRatings(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const calculateOverallRating = (): number => {
    const ratings = Object.values(questionRatings).filter(rating => rating > 0);
    if (ratings.length === 0) return 0;
    return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
  };

  const onSubmit = async (data: FormValues) => {
    // Validate that at least one question is rated
    const ratedQuestions = Object.values(questionRatings).filter(rating => rating > 0);
    if (questions.length > 0 && ratedQuestions.length === 0) {
      setSubmitError('Please rate at least one question');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Calculate overall rating from question ratings
      const overallRating = calculateOverallRating();

      // Prepare rating comments with question-specific ratings
      const ratingComments: string[] = [];
      questions.forEach(question => {
        const rating = questionRatings[question.id];
        if (rating > 0) {
          ratingComments.push(`${question.question}: ${rating}/5 stars`);
        }
      });

      // Add general comment if provided
      if (data.comment.trim()) {
        ratingComments.push(`Additional Comments: ${data.comment.trim()}`);
      }

      // Prepare question ratings data
      const questionRatingsData = questions
        .filter(question => questionRatings[question.id] > 0)
        .map(question => ({
          questionId: question.id,
          rating: questionRatings[question.id],
        }));

      // Submit rating
      const ratingData = {
        targetId,
        targetRole,
        raterName: data.raterName,
        raterEmail: data.raterEmail,
        score: overallRating,
        comment: ratingComments.length > 0 ? ratingComments.join('\n\n') : undefined,
        questionRatings: questionRatingsData,
      };

      const ratingResponse = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      const ratingResult = await ratingResponse.json();

      if (!ratingResponse.ok) {
        throw new Error(ratingResult.message || 'Failed to submit rating');
      }

      // Submit complaint if checkbox is checked and comment is provided
      if (data.isComplaint && data.comment.trim()) {
        const complaintData = {
          targetId,
          targetRole,
          complainantName: data.raterName,
          complainantEmail: data.raterEmail,
          subject: `Service Complaint - ${targetName}`,
          description: data.comment.trim(),
        };

        const complaintResponse = await fetch('/api/complaints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(complaintData),
        });

        // Don't fail the whole process if complaint submission fails
        if (!complaintResponse.ok) {
          console.warn('Failed to submit complaint, but rating was successful');
        }
      }

      // Set submitted state to true
      setSubmitted(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">
          Your rating for {targetName} has been submitted successfully.
          {watchIsComplaint && watchComment?.trim() && (
            <span className="block mt-2">Your complaint has also been submitted for review.</span>
          )}
        </p>
        <div className="mt-4">
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-alliance-gray-50 p-4 rounded-md text-center">
        <h3 className="text-lg font-semibold mb-2">Rate {targetName}</h3>
        <p className="text-alliance-gray-600 text-sm mb-4">
          {targetRole === 'agent' ? 'Insurance Agent' : 'Alliance Employee'}
        </p>
        {calculateOverallRating() > 0 && (
          <div className="flex justify-center mt-2">
            <div className="text-center">
              <StarRating value={calculateOverallRating()} readonly size="lg" />
              <p className="text-alliance-gray-700 mt-2 text-sm">
                Overall Rating: {calculateOverallRating()}/5
              </p>
            </div>
          </div>
        )}
      </div>

      <Input
        label="Your Name"
        {...register('raterName', {
          required: 'Your name is required',
        })}
        error={errors.raterName?.message}
      />

      <Input
        label="Your Email"
        type="email"
        {...register('raterEmail', {
          required: 'Your email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={errors.raterEmail?.message}
      />

      {/* Rating Questions */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-alliance-gray-500">Loading questions...</p>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-alliance-gray-900">
            Please rate the following aspects:
          </h3>
          {questions.map((question) => (
            <div key={question.id} className="bg-white border border-alliance-gray-200 rounded-lg p-4">
              <label className="block mb-3 text-sm font-medium text-alliance-gray-700">
                {question.question}
              </label>
              <div className="flex items-center justify-center">
                <StarRating
                  value={questionRatings[question.id] || 0}
                  onChange={(rating) => handleQuestionRating(question.id, rating)}
                  size="md"
                />
                {questionRatings[question.id] > 0 && (
                  <span className="ml-3 text-sm text-alliance-gray-600">
                    {questionRatings[question.id]}/5
                  </span>
                )}
              </div>
              {questionRatings[question.id] > 0 && (
                <p className="text-center text-xs text-alliance-gray-500 mt-2">
                  {questionRatings[question.id] === 1 && 'Poor'}
                  {questionRatings[question.id] === 2 && 'Fair'}
                  {questionRatings[question.id] === 3 && 'Good'}
                  {questionRatings[question.id] === 4 && 'Very Good'}
                  {questionRatings[question.id] === 5 && 'Excellent'}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-alliance-gray-50 p-4 rounded-md text-center">
          <p className="text-alliance-gray-500">
            No specific rating questions are configured for {targetRole}s.
          </p>
        </div>
      )}

      {/* Comments Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-alliance-gray-700">
          Additional Comments (optional)
        </label>
        <textarea
          className="w-full px-4 py-2 bg-white border border-alliance-gray-300 rounded-md text-alliance-gray-900 placeholder-alliance-gray-400 focus:outline-none focus:ring-2 focus:border-alliance-red-300 focus:ring-alliance-red-500 transition duration-150"
          rows={4}
          placeholder="Share any additional feedback..."
          {...register('comment')}
        ></textarea>
        
        {/* Complaint Checkbox */}
        {watchComment && watchComment.trim() && (
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="isComplaint"
              className="mt-1 h-4 w-4 text-alliance-red-600 focus:ring-alliance-red-500 border-alliance-gray-300 rounded"
              {...register('isComplaint')}
            />
            <label htmlFor="isComplaint" className="text-sm text-alliance-gray-700">
              <span className="font-medium">Submit this comment as a complaint</span>
              <span className="block text-xs text-alliance-gray-500 mt-1">
                Check this box if your comment describes a problem or concern that requires attention from management.
              </span>
            </label>
          </div>
        )}
      </div>

      {submitError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </form>
  );
};

export default RatingForm;
