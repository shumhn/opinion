#!/bin/bash

echo "🚀 Setting up Arcium Employee Feedback System on Localnet"
echo "=========================================================="

# Check if solana-test-validator is running
if ! pgrep -x "solana-test-validator" > /dev/null; then
    echo "❌ Solana test validator not running"
    echo "Starting validator..."
    solana-test-validator &
    sleep 5
fi

echo "✅ Solana test validator running"

# Switch to localnet
solana config set --url localhost
echo "✅ Switched to localnet"

# Build the program
echo "📦 Building program..."
cd /Users/sumangiri/desktop/opinion
arcium build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy the program
echo "🚀 Deploying program to localnet..."
solana program deploy target/deploy/encrypted_opinion_mpc.so

if [ $? -ne 0 ]; then
    echo "❌ Deploy failed"
    exit 1
fi

echo "✅ Program deployed"

# Initialize computation definitions
echo "🔧 Initializing MPC computation definitions..."
# This would typically be done through a TypeScript test or CLI script
# For now, we'll note that it needs to be done

echo ""
echo "=========================================================="
echo "✅ Localnet setup complete!"
echo ""
echo "Next steps:"
echo "1. Initialize MPC computation definitions (see tests/)"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Connect wallet and submit feedback"
echo ""
echo "Program ID: AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM"
echo "=========================================================="
