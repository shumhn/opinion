'use client'

import { useState } from 'react'

interface SurveyResult {
  question: string
  totalResponses: number
  averageRating: number
  distribution: number[]
}

export function SurveySection() {
  const [currentSurvey] = useState({
    id: 1,
    question: 'How satisfied are you with privacy-preserving social platforms?',
    type: 'rating', // 1-5 stars
    active: true
  })

  const [userRating, setUserRating] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Mock survey results (in real app, would fetch from blockchain)
  const [results] = useState<SurveyResult>({
    question: 'How satisfied are you with privacy-preserving social platforms?',
    totalResponses: 47,
    averageRating: 4.2,
    distribution: [2, 3, 8, 15, 19] // 1-5 star distribution
  })

  const handleSubmitRating = () => {
    if (userRating === null) return

    // In real app, this would submit encrypted response to MPC circuit
    console.log('Submitting encrypted rating:', userRating)
    setSubmitted(true)

    // Mock delay for submission
    setTimeout(() => {
      alert('Rating submitted successfully! Your response is encrypted and contributes to anonymous statistics.')
    }, 1000)
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={interactive ? () => onRate?.(i + 1) : undefined}
        disabled={!interactive}
        className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Anonymous Survey
      </h3>

      {/* Active Survey */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {currentSurvey.question}
        </h4>

        {!submitted ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rate your satisfaction (1-5 stars):
              </label>
              <div className="flex space-x-1">
                {renderStars(userRating || 0, true, setUserRating)}
              </div>
            </div>

            <button
              onClick={handleSubmitRating}
              disabled={userRating === null}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Submit Anonymous Rating
            </button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 dark:text-green-400">✅</span>
              <span className="text-green-800 dark:text-green-200">
                Rating submitted! Your response is encrypted and contributes to anonymous statistics.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Survey Results */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Anonymous Results
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {results.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Rating (out of 5)
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {results.totalResponses}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Anonymous Responses
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Rating Distribution:
          </h5>
          <div className="space-y-2">
            {results.distribution.map((count, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 min-w-[60px]">
                  {renderStars(index + 1)}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                    style={{
                      width: `${(count / Math.max(...results.distribution)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[30px]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        <div className="flex items-start space-x-3">
          <span className="text-purple-600 dark:text-purple-400 text-xl">🧮</span>
          <div className="text-sm text-purple-800 dark:text-purple-200">
            <strong>MPC Technology:</strong> Your individual rating remains encrypted. Only aggregate statistics are revealed through Arcium's Multi-Party Computation. No single entity can see your personal response.
          </div>
        </div>
      </div>
    </div>
  )
}
