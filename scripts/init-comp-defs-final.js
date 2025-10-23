const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');
const { getMXEAccAddress, getCompDefAccAddress, getCompDefAccOffset } = require('@arcium-hq/client');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = 'AqQHGMDSDezFmf348JaymgPpLSfzswef9EXd1Hw5PUoM';
const ARCIUM_ID = new PublicKey('BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6');
const KEYPAIR_PATH = process.env.HOME + '/.config/solana/devnet-keypair.json';

// Load keypair
const keypairData = JSON.parse(require('fs').readFileSync(KEYPAIR_PATH, 'utf-8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('Wallet:', payer.publicKey.toString());

// Setup connection
const connection = new Connection(RPC_URL, 'confirmed');

// Derive MXE account
const mxeAccount = getMXEAccAddress(new PublicKey(PROGRAM_ID));
console.log('MXE Account:', mxeAccount.toString());

// Circuit names that match the Rust constants
const circuits = [
  'init_vote_stats',
  'vote', 
  'reveal_result',
  'init_opinion_stats',
  'submit_opinion',
  'reveal_opinion_stats',
  'init_feedback_stats',
  'submit_feedback',
  'reveal_feedback_stats'
];

// Instruction discriminators (from IDL)
const discriminatorMap = {
  'init_vote_stats': [157,38,21,148,151,46,93,157],
  'vote': [227,119,186,182,31,37,236,155],
  'reveal_result': [37,58,75,132,146,44,185,221],
  'init_opinion_stats': [196,16,14,254,21,238,208,93],
  'submit_opinion': [142,48,47,229,153,53,79,130],
  'reveal_opinion_stats': [49,255,93,149,81,96,5,215],
  'init_feedback_stats': [230,59,184,11,61,255,110,166],
  'submit_feedback': [113,221,25,109,219,88,86,204],
  'reveal_feedback_stats': [217,200,123,158,156,192,244,63]
};

async function initCompDef(circuitName) {
  try {
    console.log(`Initializing ${circuitName}...`);
    
    // Get the correct offset for this circuit
    const offsetBytes = getCompDefAccOffset(circuitName);
    const offsetNum = new DataView(offsetBytes.buffer).getUint32(0, true);
    const compDefAccount = getCompDefAccAddress(new PublicKey(PROGRAM_ID), offsetNum);
    
    console.log(`   Comp Def Account: ${compDefAccount.toString()}`);
    
    // Get discriminator
    const discriminator = discriminatorMap[circuitName];
    if (!discriminator) {
      throw new Error(`No discriminator found for ${circuitName}`);
    }
    
    // Build instruction data (discriminator)
    const data = Buffer.from(discriminator);
    
    // Accounts required for init_comp_def
    const keys = [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // payer
      { pubkey: mxeAccount, isSigner: false, isWritable: true }, // mxe_account
      { pubkey: compDefAccount, isSigner: false, isWritable: true }, // comp_def_account
      { pubkey: ARCIUM_ID, isSigner: false, isWritable: false }, // arcium_program
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ];
    
    const instruction = new TransactionInstruction({
      keys: keys,
      programId: new PublicKey(PROGRAM_ID),
      data: data,
    });
    
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const signature = await connection.sendTransaction(transaction, [payer]);
    console.log(`   ✅ TX: ${signature.slice(0, 20)}...`);
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
  
  for (const circuit of circuits) {
    const success = await initCompDef(circuit);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
  }
  
  console.log(`\n✅ Success: ${successCount}/${circuits.length}`);
  if (successCount === circuits.length) {
    console.log('🎉 Platform fully operational!');
  }
}

main().catch(console.error);
