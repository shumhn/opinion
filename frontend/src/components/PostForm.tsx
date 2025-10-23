'use client'

import { useState } from 'react'
import { usePosts } from '@/lib/usePosts'

export function PostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState('')
  const { createPost, loading } = usePosts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      console.log('Attempting to create post...')
      const signature = await createPost(title.trim(), content.trim(), topic.trim() || 'general')
      console.log('Post created successfully:', signature)
      
      // Clear form
      setTitle('')
      setContent('')
      setTopic('')
      alert(`Post created successfully! 🎉\n\nTransaction: ${signature}\n\nView on Solana Explorer`)
    } catch (error: any) {
      console.error('Error creating post:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Show specific error message
      const errorMessage = error.message || 'Unknown error'
      
      if (errorMessage.includes('insufficient funds')) {
        alert('⚠️ Insufficient SOL for transaction.\n\nGet devnet SOL from:\nhttps://faucet.solana.com')
      } else if (errorMessage.includes('cancelled') || errorMessage.includes('rejected')) {
        alert('Transaction was cancelled.')
      } else if (errorMessage.includes('Wallet not connected')) {
        alert('Please connect your wallet first.')
      } else {
        alert(`Failed to create post:\n\n${errorMessage}\n\nCheck browser console for more details.`)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Create New Post
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="What's your opinion about?"
            required
            maxLength={32}
          />
          <p className="text-xs text-gray-500 mt-1">Will be encrypted before submission</p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Share your thoughts..."
            required
            maxLength={128}
          />
          <p className="text-xs text-gray-500 mt-1">Will be encrypted before submission</p>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic (optional)
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="tech, politics, privacy..."
            maxLength={16}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Creating Post...' : 'Create Encrypted Post'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 dark:text-blue-400">🔒</span>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Privacy Protected:</strong> Your content is encrypted on your device before being sent to the Solana blockchain. Only you can decrypt your own posts.
          </div>
        </div>
      </div>
    </div>
  )
}
