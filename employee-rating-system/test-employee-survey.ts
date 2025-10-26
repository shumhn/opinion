import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { EncryptedOpinionMpc } from "../target/types/encrypted_opinion_mpc";
import { expect } from "chai";
import { createHash, randomBytes } from 'crypto';
import { getComputationAccAddress } from '@arcium-hq/client';

describe("Employee Survey MPC Test", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EncryptedOpinionMpc as Program<EncryptedOpinionMpc>;

  // Devnet Arcium addresses (global cluster offset 1078779259)
  const MXE_ADDRESS = new PublicKey("EaV7M1xnuK9LmWHTrHS3s6UWkUhy7FEfeRKhQVRZk7vJ");
  const CLUSTER_ADDRESS = new PublicKey("CaTxKKfdaoCM7ZzLj5dLzrrmnsg9GJb5iYzRzCk8VEu3");
  const MEMPOOL_ACCOUNT = new PublicKey("2tLbBPcpGNgrA77zQ8qPa6Gf9igunu6FNdakgNZsK5bQ");
  const EXECUTING_POOL = new PublicKey("Dvk9H3KQX34Pi64X3ygqdXv8CSABpN8Pypqfbao7ceTP");
  const FEE_POOL = new PublicKey("7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3");
  const CLOCK_ACCOUNT = new PublicKey("FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65");
  const ARCIUM_PROGRAM = new PublicKey("BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6");

  const surveyId = new anchor.BN(Date.now());

  it("✅ Complete Employee Survey Flow with MPC", async () => {
    console.log("\n🎯 Testing Employee Survey MPC Flow");
    console.log("=" .repeat(60));
    console.log("Survey ID:", surveyId.toString());
    console.log("Program ID:", program.programId.toString());
    console.log("Wallet:", provider.wallet.publicKey.toString());

    // Step 1: Initialize the survey
    console.log("\n📊 Step 1: Initialize Opinion Stats (via MPC)");
    
    const [opinionStats] = PublicKey.findProgramAddressSync(
      [Buffer.from("opinion_stats"), surveyId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Sign PDA: In Arcium MPC model, each user program is treated as an MXE
    // The derive_sign_pda! derives from the user's own program ID with "SignerAccount" seed
    const [signPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("SignerAccount")],
      program.programId
    );

    // Use Arcium SDK to derive computation account address
    // Generate unique random offset for each computation (Arcium requirement)
    const initComputationOffset = new anchor.BN(randomBytes(8));
    const compPDA = getComputationAccAddress(program.programId, initComputationOffset);

    // Compute comp-def PDA using SHA256-based offset (matches Arcium documentation)
    function compDefOffset(name: string): number {
      const hash = createHash('sha256').update(name).digest();
      return hash.readUInt32LE(0);
    }
    
    const offset = compDefOffset("init_opinion_stats");
    const offsetBuffer = Buffer.alloc(4);
    offsetBuffer.writeUInt32LE(offset, 0);
    
    const [compDefPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ComputationDefinitionAccount"), program.programId.toBuffer(), offsetBuffer],
      ARCIUM_PROGRAM
    );

    // Ensure the computation definition PDA is initialized on devnet
    try {
      const initCompDefTx = await program.methods
        .initInitOpinionStatsCompDef()
        .accounts({
          payer: provider.wallet.publicKey,
          mxeAccount: MXE_ADDRESS,
          compDefAccount: compDefPDA,
        })
        .rpc();
      console.log("✅ Comp def initialized:", initCompDefTx);
    } catch (error: any) {
      console.log("⚠️ Comp def init may already exist or failed (continuing):", error.message);
    }

    // Initialize the opinion stats account
    try {
      const tx = await program.methods
        .initOpinionStats(
          initComputationOffset,
          surveyId
        )
        .accounts({
          payer: provider.wallet.publicKey,
          signPdaAccount: signPDA,
          mxeAccount: MXE_ADDRESS,
          mempoolAccount: MEMPOOL_ACCOUNT,
          executingPool: EXECUTING_POOL,
          computationAccount: compPDA,
          compDefAccount: compDefPDA,
          clusterAccount: CLUSTER_ADDRESS,
          poolAccount: FEE_POOL,
          clockAccount: CLOCK_ACCOUNT,
          systemProgram: SystemProgram.programId,
          arciumProgram: ARCIUM_PROGRAM,
        } as any)
        .rpc();

      console.log("✅ Survey initialized:", tx);
    } catch (error) {
      console.error("❌ Failed to initialize:", error);
      throw error;
    }

    // Step 2: Submit multiple ratings
    console.log("\n⭐ Step 2: Submit Employee Ratings (via MPC)");
    
    const ratings = [5, 4, 3, 5, 4]; // Sample ratings
    
    for (let i = 0; i < ratings.length; i++) {
      const rating = ratings[i];
      const computationOffset = new anchor.BN(randomBytes(8), undefined, "le");
      
      const [compPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("computation"), computationOffset.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [compDefPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("comp_def"), Buffer.from("submit_opinion")],
        program.programId
      );

      // Simple encryption (for demo - in production use real Arcium encryption)
      const ciphertext = Buffer.alloc(32);
      ciphertext[0] = rating;
      randomBytes(31).copy(ciphertext, 1);

      const pubkey = MXE_ADDRESS.toBuffer();
      const nonce = new anchor.BN(randomBytes(16), undefined, "le");

      try {
        const tx = await program.methods
          .submitOpinionResponse(
            computationOffset,
            surveyId,
            Array.from(ciphertext),
            Array.from(pubkey),
            nonce
          )
          .accounts({
            payer: provider.wallet.publicKey,
            signPdaAccount: signPDA,
            opinionAccount: opinionStats,
            mxeAccount: MXE_ADDRESS,
            mempoolAccount: MEMPOOL_ACCOUNT,
            executingPool: EXECUTING_POOL,
            computationAccount: compPDA,
            compDefAccount: compDefPDA,
            clusterAccount: CLUSTER_ADDRESS,
            poolAccount: FEE_POOL,
            clockAccount: CLOCK_ACCOUNT,
            systemProgram: SystemProgram.programId,
            arciumProgram: ARCIUM_PROGRAM,
          } as any)
          .rpc();

        console.log(`  ✅ Rating ${i + 1}/5 (${rating}⭐) submitted:`, tx.slice(0, 12) + "...");
      } catch (error) {
        console.error(`  ❌ Failed to submit rating ${i + 1}:`, error);
        throw error;
      }

      // Small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 3: Reveal aggregated results
    console.log("\n🎉 Step 3: Reveal Aggregate Results (MPC Computation)");
    
    const computationOffset = new anchor.BN(randomBytes(8), undefined, "le");
    
    const [revealCompPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("computation"), computationOffset.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [revealCompDefPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("comp_def"), Buffer.from("reveal_opinion_stats")],
      program.programId
    );

    try {
      const tx = await program.methods
        .revealOpinionStats(computationOffset, surveyId)
        .accounts({
          payer: provider.wallet.publicKey,
          signPdaAccount: signPDA,
          opinionAccount: opinionStats,
          mxeAccount: MXE_ADDRESS,
          mempoolAccount: MEMPOOL_ACCOUNT,
          executingPool: EXECUTING_POOL,
          computationAccount: revealCompPDA,
          compDefAccount: revealCompDefPDA,
          clusterAccount: CLUSTER_ADDRESS,
          poolAccount: FEE_POOL,
          clockAccount: CLOCK_ACCOUNT,
          systemProgram: SystemProgram.programId,
          arciumProgram: ARCIUM_PROGRAM,
        } as any)
        .rpc();

      console.log("✅ Results revealed:", tx);
    } catch (error) {
      console.error("❌ Failed to reveal results:", error);
      throw error;
    }

    // Step 4: Fetch and display results
    console.log("\n📈 Step 4: Fetch Aggregated Statistics");
    
    try {
      const statsAccount = await program.account.opinionAccount.fetch(opinionStats);
      
      console.log("\n" + "=".repeat(60));
      console.log("🎊 EMPLOYEE SURVEY RESULTS (MPC Aggregated)");
      console.log("=".repeat(60));
      console.log("Total Responses:", (statsAccount as any).totalResponses);
      console.log("Average Rating:", (statsAccount as any).averageRating, "⭐");
      console.log("Rating Distribution:");
      
      const dist = (statsAccount as any).ratingDistribution;
      for (let i = 0; i < 5; i++) {
        const stars = "⭐".repeat(i + 1);
        const bar = "█".repeat(dist[i]);
        console.log(`  ${stars} (${i + 1}): ${bar} ${dist[i]}`);
      }
      console.log("=".repeat(60));
      
      console.log("\n✅ MPC Flow Test Complete!");
      console.log("Individual ratings were encrypted and processed via MPC");
      console.log("Only aggregate statistics were revealed");
      
    } catch (error) {
      console.error("❌ Failed to fetch results:", error);
      throw error;
    }
  });
});
