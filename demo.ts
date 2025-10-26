/**
 * Quick Demo - Arcium Survey System
 * Tests the opinion survey on localnet
 */

import { createArciumClient } from "./sdk/arcium-survey-client";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM");

async function main() {
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║   🚀 Arcium Survey System - Quick Demo               ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  try {
    // Load wallet
    console.log("📝 Loading wallet...");
    const keypairPath = path.join(process.env.HOME!, ".config/solana/id.json");
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    const wallet = new anchor.Wallet(keypair);
    console.log(`   Wallet: ${wallet.publicKey.toBase58()}\n`);

    // Create client
    console.log("🔗 Connecting to Arcium localnet...");
    const client = createArciumClient(wallet, PROGRAM_ID);
    console.log("   ✅ Connected to localnet");
    console.log(`   RPC: http://127.0.0.1:8899\n`);

    // Generate unique survey ID
    const surveyId = Math.floor(Date.now() / 1000);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Demo: Creating Employee Satisfaction Survey");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Step 1: Initialize Opinion Survey
    console.log("1️⃣  Initializing opinion survey...");
    console.log(`   Survey ID: ${surveyId}`);
    console.log(`   Title: "How satisfied are you with our benefits?"`);
    
    const initTx = await client.initOpinionSurvey({
      opinionId: surveyId,
      title: "How satisfied are you with our benefits?",
      questions: ["Rate from 1-5"],
    });

    console.log(`   ✅ Survey initialized!`);
    console.log(`   Transaction: ${initTx}\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✅ Demo Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 Success! The Arcium survey system is working on localnet.");
    console.log("\nNext steps:");
    console.log("  - Submit encrypted opinions");
    console.log("  - Tally results via MPC");
    console.log("  - Deploy to devnet (once infrastructure is provisioned)\n");

  } catch (error: any) {
    console.log("\n❌ Error:", error.message || error);
    if (error.logs) {
      console.log("\nProgram logs:");
      error.logs.forEach((log: string) => console.log("  ", log));
    }
    process.exit(1);
  }
}

// Run the demo
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
