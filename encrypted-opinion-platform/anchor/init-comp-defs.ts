import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

async function initCompDefs() {
  // Configure for devnet
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.EncryptedOpinion as Program;

  // Initialize computation definitions
  console.log('Initializing init_opinion_stats comp def...');
  const initOpinionSig = await program.methods.initOpinionStatsCompDef().rpc();
  console.log('init_opinion_stats initialized:', initOpinionSig);

  console.log('Initializing submit_opinion comp def...');
  const initSubmitSig = await program.methods.initSubmitOpinionCompDef().rpc();
  console.log('submit_opinion initialized:', initSubmitSig);

  console.log('Initializing reveal_opinion comp def...');
  const initRevealSig = await program.methods.initRevealOpinionCompDef().rpc();
  console.log('reveal_opinion initialized:', initRevealSig);

  console.log('All computation definitions initialized!');
}

initCompDefs().catch(console.error);
