import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { EncryptedOpinionMpc } from "../target/types/encrypted_opinion_mpc";
import * as fs from "fs";

const DEVNET_RPC = "https://api.devnet.solana.com";
const PROGRAM_ID = "AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM";
const KEYPAIR_PATH = process.env.HOME + "/.config/solana/devnet-keypair.json";

async function main() {
  console.log("\n🚀 Initializing Computation Definitions on Devnet");
  console.log("=".repeat(60));
  
  const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8"));
  const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log("Wallet:", payer.publicKey.toString());

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Balance: ${(balance / anchor.web3.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  
  const programId = new PublicKey(PROGRAM_ID);
  const idl = JSON.parse(fs.readFileSync("./target/idl/encrypted_opinion_mpc.json", "utf-8"));
  console.log("IDL keys:", Object.keys(idl));
  console.log("IDL accounts entries:", Array.isArray(idl.accounts) ? idl.accounts.length : "undefined");
  const program = new anchor.Program(idl, programId, provider) as Program<EncryptedOpinionMpc>;

  const compDefs = [
    { name: "initInitVoteStatsCompDef", label: "Init Vote Stats" },
    { name: "initVoteCompDef", label: "Vote" },
    { name: "initRevealResultCompDef", label: "Reveal Result" },
    { name: "initInitOpinionStatsCompDef", label: "Init Opinion Stats" },
    { name: "initSubmitOpinionCompDef", label: "Submit Opinion" },
    { name: "initRevealOpinionStatsCompDef", label: "Reveal Opinion Stats" },
    { name: "initInitFeedbackStatsCompDef", label: "Init Feedback Stats" },
    { name: "initSubmitFeedbackCompDef", label: "Submit Feedback" },
    { name: "initRevealFeedbackStatsCompDef", label: "Reveal Feedback Stats" },
  ];

  console.log("\n🔧 Initializing", compDefs.length, "comp-defs...\n");
  let successCount = 0;

  for (const compDef of compDefs) {
    try {
      console.log(`${compDef.label}...`);
      const tx = await (program.methods as any)[compDef.name]().rpc();
      console.log(`   ✅ ${tx.slice(0, 20)}...`);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      if (error.message?.includes("already in use")) {
        console.log(`   ✅ Already initialized`);
        successCount++;
      } else {
        console.log(`   ❌ ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Success: ${successCount}/${compDefs.length}`);
  if (successCount === compDefs.length) console.log("🎉 Platform fully operational!");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
