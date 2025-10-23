'use client'

import { usePosts, Post } from '@/lib/usePosts'
import { useWallet } from '@solana/wallet-adapter-react'

import { decryptData } from '@/lib/solana'

function PostCard({ post }: { post: Post }) {
  const { publicKey } = useWallet()
  const isAuthor = publicKey?.toString() === post.author

  // Decrypt content for the author
  const decryptedTitle = isAuthor && post.encryptedTitle ? decryptData(post.encryptedTitle) : null
  const decryptedContent = isAuthor && post.encryptedContent ? decryptData(post.encryptedContent) : null
  const decryptedTopic = isAuthor && post.encryptedTopic ? decryptData(post.encryptedTopic) : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {decryptedTitle || post.title || '🔒 Encrypted Post'}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            {decryptedContent || post.content || '🔒 Content is encrypted'}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Topic: {decryptedTopic || post.topic || '🔒 Encrypted'}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{post.totalComments} comments</span>
            <span>•</span>
            <span>{post.totalFeedback} feedback</span>
            <span>•</span>
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              ID: {post.id}
            </span>
          </div>
        </div>
      </div>

      {!isAuthor && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400">🔒</span>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              This post is encrypted. Only the author can view the full content.
            </span>
          </div>
        </div>
      )}

      {isAuthor && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span className="text-sm text-green-800 dark:text-green-200">
              You are the author of this post. The content is decrypted for you.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function PostList() {
  const { posts, loading, refreshPosts } = usePosts()

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading posts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Latest Posts
        </h3>
        <button
          onClick={refreshPosts}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share your encrypted opinion!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
