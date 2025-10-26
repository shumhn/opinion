'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { EmployeeSurveyClient } from '../lib/survey-client'

/**
 * Survey Questions for Employee Feedback
 */
const SURVEY_QUESTIONS = [
  {
    id: 1n,
    question: 'How satisfied are you with the company leadership?',
    category: 'Leadership'
  },
  {
    id: 2n,
    question: 'How would you rate the work-life balance?',
    category: 'Work-Life Balance'
  },
  {
    id: 3n,
    question: 'How satisfied are you with your compensation?',
    category: 'Compensation'
  },
  {
    id: 4n,
    question: 'How would you rate the company culture?',
    category: 'Culture'
  },
  {
    id: 5n,
    question: 'How satisfied are you with career growth opportunities?',
    category: 'Career Growth'
  }
]

export default function EmployeeSurvey() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [selectedSurvey, setSelectedSurvey] = useState<bigint | null>(null)
  const [selectedRating, setSelectedRating] = useState<number>(3)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [results, setResults] = useState<any>(null)

  const client = wallet.publicKey ? new EmployeeSurveyClient(connection, wallet) : null

  /**
   * Initialize a new survey
   */
  const handleInitSurvey = async (surveyId: bigint) => {
    if (!client) return

    setLoading(true)
    setMessage(null)
    
    try {
      const tx = await client.initializeSurvey(surveyId)
      setMessage({ type: 'success', text: `Survey initialized! TX: ${tx.slice(0, 8)}...` })
      setSelectedSurvey(surveyId)
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to initialize: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Submit a rating
   */
  const handleSubmitRating = async () => {
    if (!client || !selectedSurvey) return

    setLoading(true)
    setMessage(null)
    
    try {
      const tx = await client.submitRating(selectedSurvey, selectedRating)
      setMessage({ 
        type: 'success', 
        text: `✅ Rating submitted anonymously! Your ${selectedRating}⭐ rating is encrypted and processed via MPC. TX: ${tx.slice(0, 8)}...` 
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to submit: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reveal aggregated results
   */
  const handleRevealResults = async () => {
    if (!client || !selectedSurvey) return

    setLoading(true)
    setMessage(null)
    
    try {
      const tx = await client.revealResults(selectedSurvey)
      setMessage({ type: 'success', text: `Results revealed! TX: ${tx.slice(0, 8)}...` })
      
      // Fetch results after a delay
      setTimeout(async () => {
        const surveyResults = await client.getSurveyResults(selectedSurvey)
        setResults(surveyResults)
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to reveal: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Render star rating selector
   */
  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center my-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setSelectedRating(star)}
            className={`text-4xl transition-all ${
              star <= selectedRating ? 'text-yellow-400' : 'text-gray-300'
            } hover:scale-110`}
            disabled={loading}
          >
            ⭐
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔐 Anonymous Employee Survey
          </h1>
          <p className="text-gray-600">
            Powered by Arcium MPC - Your responses are 100% anonymous
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletMultiButton />
        </div>

        {!wallet.publicKey ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">Please connect your wallet to participate in surveys</p>
          </div>
        ) : (
          <>
            {/* Survey Selection */}
            {!selectedSurvey ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Select a Survey Question
                </h2>
                <div className="space-y-4">
                  {SURVEY_QUESTIONS.map((survey) => (
                    <button
                      key={survey.id.toString()}
                      onClick={() => handleInitSurvey(survey.id)}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-indigo-200">{survey.category}</div>
                          <div className="text-lg">{survey.question}</div>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Rating Submission */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                  <div className="text-center mb-4">
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                      {SURVEY_QUESTIONS.find(q => q.id === selectedSurvey)?.category}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {SURVEY_QUESTIONS.find(q => q.id === selectedSurvey)?.question}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Rate from 1 (Poor) to 5 (Excellent)
                    </p>
                  </div>

                  {renderStars()}

                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      {selectedRating} / 5
                    </span>
                  </div>

                  <button
                    onClick={handleSubmitRating}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : '🔒 Submit Anonymous Rating'}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setSelectedSurvey(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ← Back to surveys
                    </button>
                  </div>
                </div>

                {/* Reveal Results */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📊 View Aggregated Results
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Click below to reveal aggregated statistics computed via MPC. Individual responses remain private.
                  </p>
                  
                  <button
                    onClick={handleRevealResults}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Revealing...' : '🎯 Reveal Aggregate Results'}
                  </button>

                  {results && (
                    <div className="mt-6 p-6 bg-indigo-50 rounded-lg">
                      <h4 className="font-bold text-lg mb-4 text-indigo-900">
                        📈 Aggregated Results (MPC Computed)
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total Responses:</span>
                          <span className="font-bold text-indigo-600">{results.totalResponses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Average Rating:</span>
                          <span className="font-bold text-indigo-600">{results.averageRating} ⭐</span>
                        </div>
                        <div className="mt-4">
                          <div className="text-gray-700 mb-2">Rating Distribution:</div>
                          {results.ratingDistribution.map((count: number, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 mb-1">
                              <span className="w-16 text-sm">{idx + 1} ⭐</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-4">
                                <div
                                  className="bg-indigo-600 h-4 rounded-full"
                                  style={{ 
                                    width: `${(count / results.totalResponses) * 100}%` 
                                  }}
                                />
                              </div>
                              <span className="w-12 text-sm text-gray-600">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">🔐 All ratings are encrypted before submission</p>
          <p className="mb-2">🧮 Aggregation happens via Arcium MPC - individual ratings never revealed</p>
          <p>✅ Deployed on Solana Devnet with Arcium Global Cluster</p>
        </div>
      </div>
    </div>
  )
}
