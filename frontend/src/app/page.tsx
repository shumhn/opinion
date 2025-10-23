'use client'

import { WalletConnectButton } from '@/components/WalletConnectButton'
import { PostForm } from '@/components/PostForm'
import { PostList } from '@/components/PostList'
import { SurveySection } from '@/components/SurveySection'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔐</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Arcium Encrypted Opinion Platform
              </h1>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Share Opinions <span className="text-blue-600">Privately</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create encrypted posts, participate in anonymous surveys, and engage in privacy-preserving discussions powered by Arcium MPC.
          </p>
        </div>

        {/* Main Application Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Post Creation */}
          <div className="lg:col-span-1">
            <PostForm />
          </div>

          {/* Right Columns - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Posts Feed */}
            <PostList />

            {/* Survey Section */}
            <SurveySection />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl">🔐</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Arcium Hackathon 2025
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Privacy-preserving social platform with Multi-Party Computation
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>Program ID: AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM</span>
              <span>•</span>
              <span>Deployed on Solana Devnet</span>
              <span>•</span>
              <span>Arcium MPC Enabled</span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigator.clipboard.writeText('cd /Users/sumangiri/Desktop/opinion && node demo-simple.js')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
              >
                Run Demo Script
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
