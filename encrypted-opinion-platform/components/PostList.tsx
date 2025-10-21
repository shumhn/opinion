'use client';

import { useState, useEffect } from 'react';
import { Lock, Users, Clock, CheckCircle } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  owner: string;
  contentHash: string;
  responseCount: number;
  deadline: number;
  status: 'active' | 'revealed';
  createdAt: number;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch posts from Solana
    // For now, use mock data
    const mockPosts: Post[] = [
      {
        id: '1',
        title: 'What should be the budget for a house in Kathmandu?',
        owner: 'ABC...XYZ',
        contentHash: '0x1234...5678',
        responseCount: 42,
        deadline: Date.now() + 86400000 * 2, // 2 days from now
        status: 'active',
        createdAt: Date.now() - 86400000, // 1 day ago
      },
      {
        id: '2',
        title: 'Best programming language for Web3 development?',
        owner: 'DEF...UVW',
        contentHash: '0x9abc...def0',
        responseCount: 128,
        deadline: Date.now() - 3600000, // 1 hour ago (expired)
        status: 'revealed',
        createdAt: Date.now() - 86400000 * 3, // 3 days ago
      },
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, []);

  const formatDeadline = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      return 'Expired';
    }
    
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Active Opinions
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No posts yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {post.owner}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === 'revealed' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Revealed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                      <Lock className="w-4 h-4" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{post.responseCount} responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDeadline(post.deadline)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
