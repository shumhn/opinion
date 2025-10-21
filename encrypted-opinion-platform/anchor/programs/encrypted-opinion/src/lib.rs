use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_client::idl::arcium::types::CallbackAccount;

const COMP_DEF_OFFSET_INIT_OPINION_STATS: u32 = comp_def_offset("init_opinion_stats");
const COMP_DEF_OFFSET_SUBMIT_OPINION: u32 = comp_def_offset("submit_opinion");
const COMP_DEF_OFFSET_REVEAL_OPINION: u32 = comp_def_offset("reveal_opinion");

declare_id!("5R62PZn4NWtKwUGfqYhXkxCx66Mno5V71vUJuvWNnmsK");

#[arcium_program]
pub mod encrypted_opinion {
    use super::*;

    // ============================================
    // Computation Definition Initialization
    // ============================================

    pub fn init_opinion_stats_comp_def(ctx: Context<InitOpinionStatsCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_submit_opinion_comp_def(ctx: Context<InitSubmitOpinionCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_reveal_opinion_comp_def(ctx: Context<InitRevealOpinionCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    // ============================================
    // Create Post with Encrypted Opinion Stats
    // ============================================

    /// Creates a new encrypted opinion post with the given question.
    ///
    /// This initializes a post account and sets up the encrypted opinion counters using MPC.
    /// The opinion tallies are stored in encrypted form and can only be revealed by the post owner.
    /// All individual opinions remain completely confidential throughout the process.
    pub fn create_post(
        ctx: Context<CreatePost>,
        computation_offset: u64,
        post_id: u32,
        title: String,
        content_hash: String,
        storage_cid: String,
        deadline: i64,
        nonce: u128,
    ) -> Result<()> {
        let clock = Clock::get()?;

        require!(title.len() <= 200, ErrorCode::TitleTooLong);
        require!(deadline > clock.unix_timestamp, ErrorCode::InvalidDeadline);

        // Initialize the post account
        ctx.accounts.post_acc.title = title;
        ctx.accounts.post_acc.content_hash = content_hash;
        ctx.accounts.post_acc.storage_cid = storage_cid;
        ctx.accounts.post_acc.bump = ctx.bumps.post_acc;
        ctx.accounts.post_acc.post_id = post_id;
        ctx.accounts.post_acc.authority = ctx.accounts.payer.key();
        ctx.accounts.post_acc.nonce = nonce;
        ctx.accounts.post_acc.opinion_state = [[0; 32]; 2];
        ctx.accounts.post_acc.created_at = clock.unix_timestamp;
        ctx.accounts.post_acc.deadline = deadline;
        ctx.accounts.post_acc.response_count = 0;
        ctx.accounts.post_acc.status = PostStatus::Active;

        let args = vec![Argument::PlaintextU128(nonce)];

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        // Initialize encrypted opinion counters (agree/disagree) through MPC
        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![InitOpinionStatsCallback::callback_ix(&[CallbackAccount {
                pubkey: ctx.accounts.post_acc.key(),
                is_writable: true,
            }])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "init_opinion_stats")]
    pub fn init_opinion_stats_callback(
        ctx: Context<InitOpinionStatsCallback>,
        output: ComputationOutputs<InitOpinionStatsOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(InitOpinionStatsOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        ctx.accounts.post_acc.opinion_state = o.ciphertexts;
        ctx.accounts.post_acc.nonce = o.nonce;

        emit!(PostCreated {
            post_key: ctx.accounts.post_acc.key(),
            authority: ctx.accounts.post_acc.authority,
            title: ctx.accounts.post_acc.title.clone(),
            created_at: ctx.accounts.post_acc.created_at,
        });

        Ok(())
    }

    // ============================================
    // Submit Encrypted Opinion
    // ============================================

    /// Submits an encrypted opinion to the post.
    ///
    /// This function allows a user to cast their opinion (agree/disagree) in encrypted form.
    /// The opinion is added to the running tally through MPC computation, ensuring
    /// that individual opinions remain confidential while updating the overall count.
    pub fn submit_opinion(
        ctx: Context<SubmitOpinion>,
        computation_offset: u64,
        _post_id: u32,
        opinion: [u8; 32],
        opinion_encryption_pubkey: [u8; 32],
        opinion_nonce: u128,
    ) -> Result<()> {
        let clock = Clock::get()?;

        require!(
            ctx.accounts.post_acc.status == PostStatus::Active,
            ErrorCode::PostNotActive
        );
        require!(
            clock.unix_timestamp < ctx.accounts.post_acc.deadline,
            ErrorCode::DeadlinePassed
        );

        let args = vec![
            Argument::ArcisPubkey(opinion_encryption_pubkey),
            Argument::PlaintextU128(opinion_nonce),
            Argument::EncryptedBool(opinion),
            Argument::PlaintextU128(ctx.accounts.post_acc.nonce),
            Argument::Account(
                ctx.accounts.post_acc.key(),
                // Offset calculation: 8 bytes (discriminator) + 1 byte (bump)
                8 + 1,
                32 * 2, // 2 opinion counters (agree/disagree), each stored as 32-byte ciphertext
            ),
        ];

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![SubmitOpinionCallback::callback_ix(&[CallbackAccount {
                pubkey: ctx.accounts.post_acc.key(),
                is_writable: true,
            }])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "submit_opinion")]
    pub fn submit_opinion_callback(
        ctx: Context<SubmitOpinionCallback>,
        output: ComputationOutputs<SubmitOpinionOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(SubmitOpinionOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        ctx.accounts.post_acc.opinion_state = o.ciphertexts;
        ctx.accounts.post_acc.nonce = o.nonce;
        ctx.accounts.post_acc.response_count += 1;

        let clock = Clock::get()?;

        emit!(OpinionSubmitted {
            post_key: ctx.accounts.post_acc.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ============================================
    // Reveal Results
    // ============================================

    /// Reveals the final result of the opinion post.
    ///
    /// Only the post owner can call this function to decrypt and reveal the opinion tallies.
    /// The MPC computation compares the agree and disagree opinion counts and returns whether
    /// the majority agreed (true) or disagreed (false).
    pub fn reveal_opinion(
        ctx: Context<RevealOpinion>,
        computation_offset: u64,
        post_id: u32,
    ) -> Result<()> {
        let clock = Clock::get()?;

        require!(
            ctx.accounts.payer.key() == ctx.accounts.post_acc.authority,
            ErrorCode::Unauthorized
        );
        require!(
            clock.unix_timestamp >= ctx.accounts.post_acc.deadline,
            ErrorCode::DeadlineNotReached
        );

        msg!("Revealing opinion result for post with id {}", post_id);

        let args = vec![
            Argument::PlaintextU128(ctx.accounts.post_acc.nonce),
            Argument::Account(
                ctx.accounts.post_acc.key(),
                // Offset calculation: 8 bytes (discriminator) + 1 byte (bump)
                8 + 1,
                32 * 2, // 2 encrypted opinion counters (agree/disagree), 32 bytes each
            ),
        ];

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![RevealOpinionCallback::callback_ix(&[CallbackAccount {
                pubkey: ctx.accounts.post_acc.key(),
                is_writable: true,
            }])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "reveal_opinion")]
    pub fn reveal_opinion_callback(
        ctx: Context<RevealOpinionCallback>,
        output: ComputationOutputs<RevealOpinionOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(RevealOpinionOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        ctx.accounts.post_acc.status = PostStatus::Revealed;
        let clock = Clock::get()?;
        ctx.accounts.post_acc.revealed_at = Some(clock.unix_timestamp);

        emit!(ResultsRevealed {
            post_key: ctx.accounts.post_acc.key(),
            majority_agrees: o,
            revealed_at: clock.unix_timestamp,
        });

        Ok(())
    }
}

// ============================================
// Account Structs - Computation Definitions
// ============================================

#[init_computation_definition_accounts("init_opinion_stats", payer)]
#[derive(Accounts)]
pub struct InitOpinionStatsCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("submit_opinion", payer)]
#[derive(Accounts)]
pub struct InitSubmitOpinionCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("reveal_opinion", payer)]
#[derive(Accounts)]
pub struct InitRevealOpinionCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

// ============================================
// Account Structs - Create Post
// ============================================

#[queue_computation_accounts("init_opinion_stats", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, post_id: u32)]
pub struct CreatePost<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_OPINION_STATS))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        init,
        payer = payer,
        space = 8 + PostAccount::INIT_SPACE,
        seeds = [b"post", payer.key().as_ref(), post_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub post_acc: Account<'info, PostAccount>,
}

#[callback_accounts("init_opinion_stats")]
#[derive(Accounts)]
pub struct InitOpinionStatsCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_OPINION_STATS))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
    #[account(mut)]
    pub post_acc: Account<'info, PostAccount>,
}

// ============================================
// Account Structs - Submit Opinion
// ============================================

#[queue_computation_accounts("submit_opinion", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, _post_id: u32)]
pub struct SubmitOpinion<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_SUBMIT_OPINION))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    /// CHECK: Post authority pubkey
    #[account(address = post_acc.authority)]
    pub authority: UncheckedAccount<'info>,
    #[account(
        seeds = [b"post", authority.key().as_ref(), _post_id.to_le_bytes().as_ref()],
        bump = post_acc.bump,
        has_one = authority
    )]
    pub post_acc: Account<'info, PostAccount>,
}

#[callback_accounts("submit_opinion")]
#[derive(Accounts)]
pub struct SubmitOpinionCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_SUBMIT_OPINION))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
    #[account(mut)]
    pub post_acc: Account<'info, PostAccount>,
}

// ============================================
// Account Structs - Reveal Opinion
// ============================================

#[queue_computation_accounts("reveal_opinion", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, post_id: u32)]
pub struct RevealOpinion<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_OPINION))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        seeds = [b"post", payer.key().as_ref(), post_id.to_le_bytes().as_ref()],
        bump = post_acc.bump
    )]
    pub post_acc: Account<'info, PostAccount>,
}

#[callback_accounts("reveal_opinion")]
#[derive(Accounts)]
pub struct RevealOpinionCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_OPINION))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
    #[account(mut)]
    pub post_acc: Account<'info, PostAccount>,
}

// ============================================
// Data Accounts
// ============================================

/// Represents a confidential opinion post with encrypted tallies.
#[account]
#[derive(InitSpace)]
pub struct PostAccount {
    /// PDA bump seed
    pub bump: u8,
    /// Encrypted opinion counters: [agree_count, disagree_count] as 32-byte ciphertexts
    pub opinion_state: [[u8; 32]; 2],
    /// Unique identifier for this post
    pub post_id: u32,
    /// Public key of the post creator (only they can reveal results)
    pub authority: Pubkey,
    /// Cryptographic nonce for the encrypted opinion counters
    pub nonce: u128,
    /// The post title/question (max 200 characters)
    #[max_len(200)]
    pub title: String,
    /// Hash of the post content (stored off-chain)
    #[max_len(64)]
    pub content_hash: String,
    /// CID for decentralized storage reference
    #[max_len(100)]
    pub storage_cid: String,
    /// Timestamp when post was created
    pub created_at: i64,
    /// Deadline for opinion submissions
    pub deadline: i64,
    /// Number of opinions submitted
    pub response_count: u32,
    /// Post status (Active, Revealed, Cancelled)
    pub status: PostStatus,
    /// Timestamp when results were revealed (if applicable)
    pub revealed_at: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PostStatus {
    Active,
    Revealed,
    Cancelled,
}

// ============================================
// Events
// ============================================

#[event]
pub struct PostCreated {
    pub post_key: Pubkey,
    pub authority: Pubkey,
    pub title: String,
    pub created_at: i64,
}

#[event]
pub struct OpinionSubmitted {
    pub post_key: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ResultsRevealed {
    pub post_key: Pubkey,
    pub majority_agrees: bool,
    pub revealed_at: i64,
}

// ============================================
// Errors
// ============================================

#[error_code]
pub enum ErrorCode {
    #[msg("Title is too long (max 200 characters)")]
    TitleTooLong,
    #[msg("Deadline must be in the future")]
    InvalidDeadline,
    #[msg("Post is not active")]
    PostNotActive,
    #[msg("Deadline has passed")]
    DeadlinePassed,
    #[msg("Deadline has not been reached yet")]
    DeadlineNotReached,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Cluster account not initialized")]
    ClusterNotSet,
    #[msg("The computation was aborted")]
    AbortedComputation,
}
