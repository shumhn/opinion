'use client'

import { useState } from 'react'
import { useFeedback } from '@/lib/useFeedback'
import { useWallet } from '@solana/wallet-adapter-react'

const FEEDBACK_CATEGORIES = [
  { id: 1, name: 'Management', question: 'How would you rate management support?' },
  { id: 2, name: 'Work Culture', question: 'How satisfied are you with the work culture?' },
  { id: 3, name: 'Compensation', question: 'How satisfied are you with your compensation?' },
  { id: 4, name: 'Work-Life Balance', question: 'How would you rate work-life balance?' },
  { id: 5, name: 'Career Growth', question: 'How satisfied are you with career growth opportunities?' },
]

export function FeedbackForm() {
  const { publicKey } = useWallet()
  const [selectedCategory, setSelectedCategory] = useState(FEEDBACK_CATEGORIES[0].id)
  const [rating, setRating] = useState<number | null>(null)
  const { submitFeedback, loading } = useFeedback()

  const currentCategory = FEEDBACK_CATEGORIES.find(c => c.id === selectedCategory)!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === null) return

    try {
      console.log('Submitting anonymous feedback via Arcium MPC...')
      const signature = await submitFeedback(selectedCategory, rating)
      console.log('Feedback submitted successfully:', signature)
      
      // Clear form
      setRating(null)
      alert(`Feedback submitted anonymously! 🎉\n\nYour response is encrypted by Arcium MPC.\nOnly aggregate statistics will be revealed.\n\nTransaction: ${signature}`)
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      
      const errorMessage = error.message || 'Unknown error'
      
      if (errorMessage.includes('insufficient funds')) {
        alert('⚠️ Insufficient SOL for transaction.\n\nGet devnet SOL from:\nhttps://faucet.solana.com')
      } else if (errorMessage.includes('cancelled') || errorMessage.includes('rejected')) {
        alert('Transaction was cancelled.')
      } else if (errorMessage.includes('Wallet not connected')) {
        alert('Please connect your wallet first.')
      } else {
        alert(`Failed to submit feedback:\n\n${errorMessage}\n\nCheck browser console for more details.`)
      }
    }
  }

  const renderStars = (currentRating: number | null, interactive = true) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={interactive ? () => setRating(i + 1) : undefined}
        disabled={!interactive || !publicKey}
        className={`text-3xl transition-transform ${
          interactive ? 'cursor-pointer hover:scale-110' : ''
        } ${
          i < (currentRating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        ★
      </button>
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Submit Anonymous Feedback
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback Category *
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          >
            {FEEDBACK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {currentCategory.question}
          </label>
          <div className="flex items-center space-x-2 mb-2">
            {renderStars(rating, true)}
          </div>
          {rating && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You selected: {rating} star{rating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || rating === null || !publicKey}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Submitting Feedback...' : 'Submit Anonymous Feedback'}
        </button>

        {!publicKey && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            Please connect your wallet to submit feedback
          </p>
        )}
      </form>

      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        <div className="flex items-start space-x-2">
          <span className="text-purple-600 dark:text-purple-400">🔐</span>
          <div className="text-sm text-purple-800 dark:text-purple-200">
            <strong>Arcium MPC Privacy:</strong> Your individual rating is encrypted by Arcium's Multi-Party Computation network. Only aggregate statistics are revealed. No one can see your personal response.
          </div>
        </div>
      </div>
    </div>
  )
}
