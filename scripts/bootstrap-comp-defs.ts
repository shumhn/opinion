import * as anchor from "@coral-xyz/anchor";
import { Program, web3, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import {
  getCompDefAccAddress,
  getCompDefAccOffset,
  getArciumEnv,
} from "@arcium-hq/client";

const PROGRAM_ID = new PublicKey("AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM");

async function main() {
  const walletPath = path.join(process.env.HOME!, ".config/solana/id.json");
  const kp = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );
  const wallet = new anchor.Wallet(kp);
  const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const idlPath = path.resolve(process.cwd(), "./target/idl/encrypted_opinion_mpc.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const program = new Program(idl as any, PROGRAM_ID, provider);

  const arciumEnv = getArciumEnv();
  console.log("Cluster:", arciumEnv.arciumClusterPubkey.toBase58());

  const names = [
    "init_vote_stats",
    "vote",
    "reveal_result",
    "init_opinion_stats",
    "submit_opinion",
    "reveal_opinion_stats",
    "init_feedback_stats",
    "submit_feedback",
    "reveal_feedback_stats",
  ];

  for (const name of names) {
    const offset = getCompDefAccOffset(name);
    const compDef = getCompDefAccAddress(PROGRAM_ID, Buffer.from(offset).readUInt32LE());
    console.log(`CompDef(${name}) ->`, compDef.toBase58());

    try {
      const sig = await (program.methods as any)[`init${
        name
          .split("_")
          .map((s) => s[0].toUpperCase() + s.slice(1))
          .join("")
      }CompDef`]()
        .accounts({
          compDefAccount: compDef,
          payer: wallet.publicKey,
        })
        .rpc({ commitment: "confirmed" });
      console.log(`  init ${name} ->`, sig);
    } catch (e: any) {
      console.log(`  init ${name} failed:`, e.message || e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
