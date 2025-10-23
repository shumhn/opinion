# Arcium Opinion Platform - Frontend

**Next.js frontend for the Arcium Encrypted Opinion Platform**

## Overview

This Next.js application provides a web interface for the Arcium Encrypted Opinion Platform, featuring:

- **Wallet Integration**: Connect Phantom and Solflare wallets
- **Beautiful UI**: Modern design with Tailwind CSS
- **Privacy Focus**: Showcases encrypted posting and MPC surveys
- **Hackathon Ready**: Professional presentation of the platform

## Features

### ✅ Completed
- **Wallet Connection**: Phantom & Solflare support
- **Landing Page**: Professional design showcasing features
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode**: Automatic theme switching
- **Demo Integration**: Links to the working demo script

### 🚧 Coming Soon
- **Post Creation**: Form to create encrypted opinion posts
- **Post Display**: View encrypted posts from blockchain
- **MPC Surveys**: Participate in private surveys
- **Real-time Updates**: Live blockchain data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Wallet**: Solana Wallet Adapter
- **Blockchain**: Solana Web3.js

## Getting Started

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Run Development Server**
```bash
npm run dev
```

3. **Open Browser**
Navigate to `http://localhost:3000`

## Wallet Setup

The app supports:
- **Phantom Wallet**
- **Solflare Wallet**

Connect your wallet to interact with the platform.

## Architecture

```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx       # Root layout with wallet provider
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── WalletProvider.tsx      # Solana wallet context
│   │   └── WalletConnectButton.tsx # Connect button
│   └── lib/                 # Utilities (future)
```

## Integration with Backend

This frontend connects to the Solana program located in `../opinion/`:

- **Program ID**: `AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM`
- **Network**: Solana Devnet
- **Arcium MXE**: Active with 10 computation definitions

## Demo

Experience the full platform by running the demo script:

```bash
cd ../opinion
node demo-simple.js
```

## Deployment

Ready for deployment to Vercel, Netlify, or any static hosting service.

## Contributing

Part of the Arcium Hackathon submission. Focus on privacy-preserving social platforms.

## License

MIT License
