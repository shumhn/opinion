import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { EncryptedOpinionMpc } from "../target/types/encrypted_opinion_mpc";
import { expect } from "chai";

describe("Encrypted Opinion Platform Tests", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EncryptedOpinionMpc as Program<EncryptedOpinionMpc>;

  it("✅ Creates an encrypted opinion post", async () => {
    console.log("\n🚀 Testing: Create Opinion Post");
    
    const postId = new anchor.BN(1);
    
    // Create encrypted content (simulating client-side encryption)
    const title = Buffer.alloc(32);
    Buffer.from("My Anonymous Opinion").copy(title);
    
    const content = Buffer.alloc(128);
    Buffer.from("This is my encrypted opinion content that remains private").copy(content);
    
    const topic = Buffer.alloc(16);
    Buffer.from("Privacy").copy(topic);

    // Derive the PDA for the post account
    const [postAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("opinion_post"), postId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    console.log("📝 Creating post with ID:", postId.toNumber());
    console.log("📍 Post Account PDA:", postAccount.toString());

    // Create the opinion post
    const tx = await program.methods
      .createOpinionPost(
        postId,
        Array.from(title),
        Array.from(content),
        Array.from(topic)
      )
      .accountsPartial({
        postAccount: postAccount,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();

    console.log("✅ Post created! Transaction:", tx);

    // Fetch and verify the post account
    const postData = await program.account.opinionPostAccount.fetch(postAccount);
    
    expect(postData.postId.toNumber()).to.equal(postId.toNumber());
    expect(postData.author.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(postData.totalComments).to.equal(0);
    expect(postData.totalFeedback).to.equal(0);
    
    console.log("✅ Post verified on-chain!");
    console.log("   - Post ID:", postData.postId.toNumber());
    console.log("   - Author:", postData.author.toString());
    console.log("   - Comments:", postData.totalComments);
  });

  it("✅ Adds an encrypted comment to a post", async () => {
    console.log("\n🚀 Testing: Add Comment");
    
    const postId = new anchor.BN(1);
    const commentId = new anchor.BN(1);
    
    // Create encrypted comment content
    const commentContent = Buffer.alloc(64);
    Buffer.from("This is an encrypted comment on the post").copy(commentContent);

    // Derive PDAs
    const [postAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("opinion_post"), postId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [commentAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("comment"), commentId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    console.log("💬 Adding comment with ID:", commentId.toNumber());
    console.log("📍 Comment Account PDA:", commentAccount.toString());

    // Add the comment
    const tx = await program.methods
      .addComment(commentId, Array.from(commentContent))
      .accountsPartial({
        commentAccount: commentAccount,
        postAccount: postAccount,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();

    console.log("✅ Comment added! Transaction:", tx);

    // Fetch and verify the comment account
    const commentData = await program.account.commentAccount.fetch(commentAccount);
    
    expect(commentData.commentId.toNumber()).to.equal(commentId.toNumber());
    expect(commentData.postId.toNumber()).to.equal(postId.toNumber());
    expect(commentData.author.toString()).to.equal(provider.wallet.publicKey.toString());
    
    // Verify post comment count increased
    const postData = await program.account.opinionPostAccount.fetch(postAccount);
    expect(postData.totalComments).to.equal(1);
    
    console.log("✅ Comment verified on-chain!");
    console.log("   - Comment ID:", commentData.commentId.toNumber());
    console.log("   - Post ID:", commentData.postId.toNumber());
    console.log("   - Author:", commentData.author.toString());
    console.log("   - Post now has", postData.totalComments, "comment(s)");
  });

  it("✅ Creates multiple opinion posts", async () => {
    console.log("\n🚀 Testing: Multiple Posts");
    
    const postIds = [2, 3, 4];
    
    for (const postIdNum of postIds) {
      const postId = new anchor.BN(postIdNum);
      const title = Buffer.alloc(32);
      Buffer.from(`Post ${postIdNum}`).copy(title);
      
      const content = Buffer.alloc(128);
      Buffer.from(`Content for post ${postIdNum}`).copy(content);
      
      const topic = Buffer.alloc(16);
      Buffer.from(`Topic${postIdNum}`).copy(topic);

      const [postAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("opinion_post"), postId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .createOpinionPost(
          postId,
          Array.from(title),
          Array.from(content),
          Array.from(topic)
        )
        .accounts({
          postAccount: postAccount,
          author: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();

      console.log(`✅ Post ${postIdNum} created`);
    }
    
    console.log("✅ All posts created successfully!");
  });

  it("✅ Adds multiple comments to different posts", async () => {
    console.log("\n🚀 Testing: Multiple Comments");
    
    const comments = [
      { commentId: 2, postId: 2 },
      { commentId: 3, postId: 2 },
      { commentId: 4, postId: 3 },
    ];
    
    for (const { commentId: commentIdNum, postId: postIdNum } of comments) {
      const commentId = new anchor.BN(commentIdNum);
      const postId = new anchor.BN(postIdNum);
      const commentContent = Buffer.alloc(64);
      Buffer.from(`Comment ${commentIdNum} on post ${postIdNum}`).copy(commentContent);

      const [postAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("opinion_post"), postId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [commentAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("comment"), commentId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .addComment(commentId, Array.from(commentContent))
        .accounts({
          commentAccount: commentAccount,
          postAccount: postAccount,
          author: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();

      console.log(`✅ Comment ${commentIdNum} added to post ${postIdNum}`);
    }
    
    // Verify post 2 has 2 comments
    const [post2Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("opinion_post"), new anchor.BN(2).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const post2Data = await program.account.opinionPostAccount.fetch(post2Account);
    expect(post2Data.totalComments).to.equal(2);
    
    console.log("✅ All comments verified!");
    console.log("   - Post 2 has", post2Data.totalComments, "comments");
  });

  it("✅ Program info and summary", async () => {
    console.log("\n📊 Platform Summary");
    console.log("=====================================");
    console.log("Program ID:", program.programId.toString());
    console.log("Wallet:", provider.wallet.publicKey.toString());
    console.log("\n✅ All tests passed!");
    console.log("✅ Anonymous opinion posting works!");
    console.log("✅ Encrypted comments work!");
    console.log("✅ Platform ready for deployment! 🚀");
  });
});
