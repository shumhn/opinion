import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'

// Minimal IDL for create_opinion_post instruction
const IDL = {
  version: "0.1.0",
  name: "encrypted_opinion_mpc",
  instructions: [
    {
      name: "createOpinionPost",
      accounts: [
        { name: "postAccount", isMut: true, isSigner: false },
        { name: "author", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "clock", isMut: false, isSigner: false }
      ],
      args: [
        { name: "postId", type: "u64" },
        { name: "encryptedTitle", type: { array: ["u8", 32] } },
        { name: "encryptedContent", type: { array: ["u8", 128] } },
        { name: "encryptedTopic", type: { array: ["u8", 16] } }
      ]
    }
  ]
} as const

export function getProgram(connection: Connection, wallet: any, programId: string) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  )

  // Use (idl, programId, provider)
  return new Program(IDL as any, new PublicKey(programId), provider)
}
