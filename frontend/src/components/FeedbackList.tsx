'use client'

import { useFeedback } from '@/lib/useFeedback'
import { FeedbackData } from '@/lib/solana'

function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xl ${
          i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        ★
      </span>
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
              {feedback.category}
            </span>
            <span className="text-xs text-gray-500">
              ID: {feedback.id}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {feedback.question}
          </h4>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {feedback.totalResponses}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total Responses
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {feedback.averageRating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Average Rating
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex justify-center">
                {renderStars(feedback.averageRating)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Rating
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rating Distribution:
            </h5>
            {feedback.distribution.map((count, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 min-w-[60px]">
                  {renderStars(index + 1)}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full"
                    style={{
                      width: `${feedback.totalResponses > 0 ? (count / feedback.totalResponses) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
                  {count} ({feedback.totalResponses > 0 ? ((count / feedback.totalResponses) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Created: {new Date(feedback.createdAt * 1000).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 dark:text-purple-400">🔐</span>
          <span className="text-sm text-purple-800 dark:text-purple-200">
            <strong>Arcium MPC:</strong> Individual responses are encrypted. Only aggregate statistics computed by the MPC network are shown.
          </span>
        </div>
      </div>
    </div>
  )
}

export function FeedbackList() {
  const { feedbackItems, loading, refreshFeedback } = useFeedback()

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading feedback data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Aggregate Feedback Results
        </h3>
        <button
          onClick={refreshFeedback}
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {feedbackItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No feedback data yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Submit anonymous feedback to see aggregate results!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackItems.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      )}
    </div>
  )
}
