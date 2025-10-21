import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import PostList from "@/components/PostList";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <CreatePost />
          </div>
          
          <div>
            <PostList />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">
                1
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Encrypt Locally
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your opinion is encrypted on your device using Arcium SDK before leaving your browser.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">
                2
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Store & Verify
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Encrypted data stored on IPFS/Arweave. Solana verifies proofs and tracks metadata.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">
                3
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Reveal Results
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arcium aggregates responses privately. Only aggregated results become public.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by Arcium Encrypted Compute + Solana Blockchain</p>
        </div>
      </footer>
    </div>
  );
}
