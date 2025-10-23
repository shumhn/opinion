'use client'

import dynamic from 'next/dynamic'

// Dynamically import the wallet button with SSR disabled
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

export function WalletConnectButton() {
  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !px-6 !py-2 !rounded-lg !transition-colors" />

      {/* Wallet address display will be added after connection */}
    </div>
  )
}
