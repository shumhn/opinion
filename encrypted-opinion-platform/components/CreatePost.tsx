'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Lock, Send } from 'lucide-react';
import { encryptData } from '@/lib/arcium';
import { uploadToStorage } from '@/lib/storage';

export default function CreatePost() {
  const { publicKey, connected } = useWallet();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      // Step 1: Encrypt the content using Arcium
      setStatus({ type: 'success', message: 'Encrypting your opinion...' });
      const encryptedPayload = await encryptData(content);

      // Step 2: Upload to decentralized storage
      setStatus({ type: 'success', message: 'Uploading to IPFS...' });
      const storageResult = await uploadToStorage(encryptedPayload);

      // Step 3: Submit to Solana (placeholder - will integrate with Anchor program)
      setStatus({ type: 'success', message: 'Recording on Solana...' });
      
      // TODO: Integrate with Anchor program
      // await program.methods.createPost(
      //   title,
      //   encryptedPayload.contentHash,
      //   encryptedPayload.proof,
      //   storageResult.cid,
      //   new Date(deadline).getTime() / 1000
      // ).rpc();

      setStatus({ 
        type: 'success', 
        message: `Post created successfully! CID: ${storageResult.cid.substring(0, 10)}...` 
      });

      // Reset form
      setTitle('');
      setContent('');
      setDeadline('');
    } catch (error) {
      console.error('Error creating post:', error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create post' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Encrypted Opinion
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question or topic?"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content (Will be encrypted)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your opinion or ask a question..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            🔒 Your content will be encrypted client-side before submission
          </p>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Response Deadline
          </label>
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {status && (
          <div
            className={`p-4 rounded-lg ${
              status.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!connected || isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Create Encrypted Post
            </>
          )}
        </button>
      </form>
    </div>
  );
}
