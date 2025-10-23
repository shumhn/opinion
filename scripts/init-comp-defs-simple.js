const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = 'AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM';
const KEYPAIR_PATH = process.env.HOME + '/.config/solana/devnet-keypair.json';

// Load keypair
const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('Wallet:', payer.publicKey.toString());

// Setup connection
const connection = new Connection(RPC_URL, 'confirmed');

// Instruction discriminators (from IDL)
const instructions = [
  { name: 'init_init_vote_stats_comp_def', discriminator: [157,38,21,148,151,46,93,157] },
  { name: 'init_vote_comp_def', discriminator: [227,119,186,182,31,37,236,155] },
  { name: 'init_reveal_result_comp_def', discriminator: [37,58,75,132,146,44,185,221] },
  { name: 'init_init_opinion_stats_comp_def', discriminator: [196,16,14,254,21,238,208,93] },
  { name: 'init_submit_opinion_comp_def', discriminator: [142,48,47,229,153,53,79,130] },
  { name: 'init_reveal_opinion_stats_comp_def', discriminator: [49,255,93,149,81,96,5,215] },
  { name: 'init_init_feedback_stats_comp_def', discriminator: [230,59,184,11,61,255,110,166] },
  { name: 'init_submit_feedback_comp_def', discriminator: [113,221,25,109,219,88,86,204] },
  { name: 'init_reveal_feedback_stats_comp_def', discriminator: [217,200,123,158,156,192,244,63] },
];

async function initCompDef(discriminator, name) {
  try {
    console.log(`Initializing ${name}...`);
    
    // Build instruction data (discriminator + no args)
    const data = Buffer.from(discriminator);
    
    // For now, assume minimal accounts - we need to figure out the correct accounts
    // This will likely fail but will give us better error info
    const instruction = new TransactionInstruction({
      keys: [], // Need to populate with correct accounts
      programId: new PublicKey(PROGRAM_ID),
      data: data,
    });
    
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const signature = await connection.sendTransaction(transaction, [payer]);
    console.log(`   ✅ TX: ${signature}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Initializing Computation Definitions on Devnet');
  console.log('='.repeat(60));
  
  let successCount = 0;
  
  for (const instr of instructions) {
    const success = await initCompDef(instr.discriminator, instr.name);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  console.log(`\n✅ Success: ${successCount}/${instructions.length}`);
  if (successCount === instructions.length) {
    console.log('🎉 Platform fully operational!');
  }
}

main().catch(console.error);
