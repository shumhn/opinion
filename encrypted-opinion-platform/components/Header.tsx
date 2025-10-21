'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Lock, Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Encrypted Opinions
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by Arcium + Solana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                End-to-End Encrypted
              </span>
            </div>
            <WalletMultiButton className="bg-purple-600! hover:bg-purple-700! rounded-lg! h-10!" />
          </div>
        </div>
      </div>
    </header>
  );
}
