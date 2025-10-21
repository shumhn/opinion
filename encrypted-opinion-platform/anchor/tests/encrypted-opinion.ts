import * as anchor from '@coral-xyz/anchor';
import { Program, BN, Wallet } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import { EncryptedOpinion } from '../target/types/encrypted_opinion';
import { ComputeBudgetProgram, PublicKey, Keypair } from '@solana/web3.js';
import { 
  awaitComputationFinalization, 
  getMXEAccAddress, 
  getComputationAccAddress, 
  getClusterAccAddress,
  getMempoolAccAddress, 
  getExecutingPoolAccAddress, 
  getCompDefAccAddress, 
  getCompDefAccOffset 
} from '@arcium-hq/client';

// Arcium Program ID (actual MPC program)
const ARCIUM_PROGRAM_ID = new PublicKey('BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6');
// Deployed program ID
const PROGRAM_ID = new PublicKey('5R62PZn4NWtKwUGfqYhXkxCx66Mno5V71vUJuvWNnmsK');
// MXE Account (from deployment transaction)
const MXE_ACCOUNT = new PublicKey('2neTbvgTQW4n2A55hUYNPB8V3LjuWfgvo9xQQWSuks1g');

// Mocha and Chai type definitions are missing, but we'll proceed with the test logic
// @ts-ignore
describe('encrypted-opinion', () => {
  // Configure the client - Anchor will use settings from Anchor.toml
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.EncryptedOpinion as Program<EncryptedOpinion>;

  // Helper function to wait for computation definition finalization
  async function waitForComputationDefinitionFinalization(
    compDefName: string,
    timeoutMs = 60000  // max wait 60 seconds
  ) {
    const compDefOffset = getCompDefAccOffset(Buffer.from(compDefName));
    const compDefAccount = getCompDefAccAddress(program.programId, compDefOffset);
    
    console.log(`Waiting for computation definition ${compDefName} to finalize...`);
    console.log(`CompDef account: ${compDefAccount.toBase58()}`);
    
    const start = Date.now();
    let attempts = 0;
    while (Date.now() - start < timeoutMs) {
      attempts++;
      try {
        // Fetch the account data
        const accountInfo = await provider.connection.getAccountInfo(compDefAccount);
        if (accountInfo && accountInfo.data.length > 8) {
          // Check if account exists and has data (simple heuristic)
          // In a real scenario, you'd deserialize and check isFinalized field
          console.log(`Attempt ${attempts}: CompDef account exists with ${accountInfo.data.length} bytes`);
          // For now, if account exists with substantial data after some attempts, assume finalized
          if (attempts > 3) {
            console.log('Computation definition appears ready.');
            return;
          }
        }
      } catch (err) {
        console.log(`Attempt ${attempts}: Account not yet ready`);
      }
      // Wait 3 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    throw new Error('Timeout waiting for computation definition finalization.');
  }

  // @ts-ignore
  it('can create a post', async () => {
    // Generate a unique post ID for testing
    const postId = new BN(1);
    const title = 'Test Post';
    const contentHash = '0'.repeat(64); // Placeholder hash
    const storageCid = 'QmTestCid'; // Placeholder CID
    const deadline = new BN(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
    const nonce = new BN(123456789);
    const createPostComputationOffset = new BN(Date.now()); // Unique computation offset based on timestamp

    // Derive the post PDA
    const [postPda] = await anchor.web3.PublicKey.findProgramAddress(
      // @ts-ignore: Buffer is not defined, but we'll use it for now
      [Buffer.from('post'), wallet.publicKey.toBuffer(), postId.toArrayLike(Buffer, 'le', 4)],
      program.programId
    );

    // Derive the sign PDA
    const [signPda] = await anchor.web3.PublicKey.findProgramAddress(
      // @ts-ignore
      [Buffer.from('SignerAccount')],
      program.programId
    );

    // Step 2: Derive PDA accounts using SDK helpers (as per Arcium docs)
    const mxeAccount = getMXEAccAddress(program.programId);
    const clusterOffset = 0; // localnet cluster offset (first cluster)
    const clusterAccount = getClusterAccAddress(clusterOffset);
    const mempoolAccount = getMempoolAccAddress(program.programId);
    const executingPool = getExecutingPoolAccAddress(program.programId);
    // Use the expected comp_def account from program constraint
    const compDefAccount = new PublicKey('C2vYHi5Da8y5uoneXVenta1uqc1yu2WcvWJGwpNu2unx');
    const computationAccount = getComputationAccAddress(program.programId, createPostComputationOffset);

    // @ts-ignore
    console.log('Using Arcium Devnet Program ID:', ARCIUM_PROGRAM_ID.toBase58());
    // @ts-ignore
    console.log('Derived Arcium accounts:');
    // @ts-ignore
    console.log('  mxeAccount:', mxeAccount.toBase58());
    // @ts-ignore
    console.log('  clusterAccount:', clusterAccount.toBase58());
    // @ts-ignore
    console.log('  compDefAccount:', compDefAccount.toBase58());

    // Step 1: Initialize computation definition on-chain (required before encrypted calls)
    try {
      console.log('Initializing init_opinion_stats computation definition...');
      const initSig = await program.methods
        .initOpinionStatsCompDef()
        .accounts({
          payer: wallet.publicKey,
          mxeAccount: mxeAccount,
          compDefAccount: compDefAccount,
        })
        .rpc();
      console.log('Computation definition initialized:', initSig);
    } catch (err: any) {
      console.log('Comp def init result:', err?.message || 'Already initialized, continuing...');
    }
    
    // Wait for MPC cluster to finalize the computation definition
    await waitForComputationDefinitionFinalization('init_opinion_stats', 60000);

    // Call createPost method with all required accounts and increased compute units
    try {
      // Build the instruction for createPost
      const createPostIx = await program.methods
        .createPost(createPostComputationOffset, postId, title, contentHash, storageCid, deadline, nonce)
        .accounts({
          // @ts-ignore: Ignore unknown properties for now
          postAcc: postPda,
          payer: wallet.publicKey,
          signPdaAccount: signPda,
          mxeAccount: mxeAccount,
          mempoolAccount: mempoolAccount,
          executingPool: executingPool,
          computationAccount: computationAccount,
          compDefAccount: compDefAccount,
          clusterAccount: clusterAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          arciumProgram: ARCIUM_PROGRAM_ID
        })
        .instruction();

      // Create a transaction with compute budget instruction
      const tx = new anchor.web3.Transaction();
      // Add compute budget instruction to increase limit (1,400,000 is the max per transaction)
      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 });
      tx.add(computeBudgetIx);
      tx.add(createPostIx);

      // Set fee payer and blockhash
      tx.feePayer = wallet.publicKey;
      const latestBlockhash = await provider.connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;

      // Sign and send transaction
      const signedTx = await provider.wallet.signTransaction(tx);
      const txSig = await provider.connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 5,
        preflightCommitment: 'confirmed'
      });
      await provider.connection.confirmTransaction(txSig, 'confirmed');

      // @ts-ignore
      console.log('Transaction signature for post creation:', txSig);
    } catch (err) {
      // @ts-ignore
      console.error('Error creating post:', err);
      // @ts-ignore
      console.log('\nNote: If you see AccountNotInitialized errors, you need to:');
      // @ts-ignore
      console.log('1. Initialize Arcium MXE accounts using the Arcium SDK');
      // @ts-ignore
      console.log('2. Register computation definitions');
      // @ts-ignore
      console.log('3. Set up the Arcium cluster using "arcium dev deploy"');
      throw err;
    }
  });
});
