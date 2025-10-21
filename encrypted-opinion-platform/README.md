# 🔐 Encrypted Opinion Platform

A decentralized platform for encrypted opinions, polls, and feedback powered by **Arcium** (encrypted compute) and **Solana** (blockchain verification).

## 🌟 Features

- **End-to-End Encryption**: All opinions encrypted client-side using Arcium SDK
- **Zero-Knowledge Proofs**: Verify data integrity without revealing content
- **Decentralized Storage**: IPFS/Arweave for encrypted content storage
- **On-Chain Verification**: Solana Anchor program tracks metadata and proofs
- **Private Aggregation**: Arcium computes aggregated results without exposing individual responses
- **Wallet Integration**: Phantom, Solflare, and Backpack wallet support

## 🏗️ Architecture

```
User Input
   ↓ (Encrypt via Arcium SDK)
Encrypted Data + Proof
   ↓
Stored on IPFS/Arweave
   ↓ (Hash recorded on Solana)
Solana verifies proof
   ↓
Arcium aggregates encrypted responses
   ↓
Revealed Results (optional)
   ↓
Users view verified outcomes
```

## 🛠️ Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 14, React, Tailwind CSS, Lucide Icons |
| **Wallet** | Solana Wallet Adapter (Phantom, Solflare, Backpack) |
| **Blockchain** | Solana, Anchor Framework, Solana Web3.js |
| **Encryption** | Arcium Encrypted Compute SDK |
| **Storage** | IPFS, Arweave, Bundlr |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Solana CLI (for Anchor program deployment)
- Rust and Anchor CLI (for smart contract development)
- A Solana wallet (Phantom, Solflare, or Backpack)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd encrypted-opinion-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Anchor Program Setup

1. **Navigate to the Anchor directory**
   ```bash
   cd anchor
   ```

2. **Build the program**
   ```bash
   anchor build
   ```

3. **Deploy to Devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

4. **Update the program ID**
   Copy the program ID from the deployment output and update:
   - `anchor/programs/encrypted-opinion/src/lib.rs` (line 3)
   - `anchor/Anchor.toml` (programs section)

## 📁 Project Structure

```
encrypted-opinion-platform/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout with wallet provider
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── WalletProvider.tsx # Solana wallet context
│   ├── Header.tsx         # App header with wallet button
│   ├── CreatePost.tsx     # Create encrypted opinion form
│   └── PostList.tsx       # Display active opinions
├── lib/                   # Utility libraries
│   ├── arcium.ts          # Arcium SDK integration
│   └── storage.ts         # IPFS/Arweave storage
├── anchor/                # Solana Anchor program
│   ├── programs/
│   │   └── encrypted-opinion/
│   │       └── src/
│   │           └── lib.rs # Smart contract
│   └── Anchor.toml        # Anchor configuration
└── README.md
```

## 🔑 Key Components

### Frontend

- **WalletProvider**: Wraps the app with Solana wallet context
- **CreatePost**: Form to create encrypted opinions with Arcium encryption
- **PostList**: Displays active and revealed opinion posts
- **Header**: Navigation with wallet connect button

### Smart Contract (Anchor)

- **create_post**: Create a new encrypted opinion post
- **submit_response**: Submit an encrypted response to a post
- **reveal_results**: Close a post and reveal aggregated results

### Libraries

- **arcium.ts**: Client-side encryption, proof generation, and aggregation
- **storage.ts**: Upload/retrieve encrypted content from IPFS/Arweave

## 🔐 How It Works

1. **User creates an opinion**
   - Content is encrypted locally using Arcium SDK
   - Zero-knowledge proof is generated
   - Encrypted payload uploaded to IPFS/Arweave

2. **On-chain recording**
   - Content hash and proof stored on Solana
   - Smart contract verifies proof validity
   - Post metadata tracked (title, deadline, owner)

3. **Users respond**
   - Each response encrypted individually
   - Proofs verified on-chain
   - Response count incremented

4. **Results revealed**
   - Arcium aggregates encrypted responses privately
   - Only aggregated results become public
   - Individual responses remain encrypted

## 🚧 Current Status

This is a **prototype implementation** with placeholder integrations:

- ✅ Frontend UI complete
- ✅ Solana Anchor program structure ready
- ✅ Wallet integration working
- ⚠️ Arcium SDK integration (placeholder - needs actual SDK)
- ⚠️ IPFS/Arweave upload (placeholder - needs API keys)
- ⚠️ Anchor program deployment (needs Solana CLI setup)

## 🔜 Next Steps

1. **Integrate actual Arcium SDK**
   - Replace placeholder encryption with real Arcium SDK
   - Implement proper key management
   - Set up encrypted compute nodes

2. **Deploy Anchor program**
   - Generate new program keypair
   - Deploy to Solana Devnet
   - Update frontend with program ID

3. **Set up storage**
   - Configure IPFS via NFT.Storage or Pinata
   - Set up Arweave via Bundlr
   - Add API keys to environment variables

4. **Connect frontend to smart contract**
   - Initialize Anchor program in frontend
   - Implement transaction signing
   - Handle on-chain state updates

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=<your-program-id>
NEXT_PUBLIC_ARCIUM_API_KEY=<your-arcium-key>
NEXT_PUBLIC_NFT_STORAGE_KEY=<your-nft-storage-key>
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

**Powered by Arcium Encrypted Compute + Solana Blockchain**
