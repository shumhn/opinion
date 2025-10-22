use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

const COMP_DEF_OFFSET_INIT_VOTE_STATS: u32 = comp_def_offset("init_vote_stats");
const COMP_DEF_OFFSET_VOTE: u32 = comp_def_offset("vote");
const COMP_DEF_OFFSET_REVEAL_RESULT: u32 = comp_def_offset("reveal_result");
const COMP_DEF_OFFSET_INIT_OPINION_STATS: u32 = comp_def_offset("init_opinion_stats");
const COMP_DEF_OFFSET_SUBMIT_OPINION: u32 = comp_def_offset("submit_opinion");
const COMP_DEF_OFFSET_REVEAL_OPINION_STATS: u32 = comp_def_offset("reveal_opinion_stats");
const COMP_DEF_OFFSET_INIT_FEEDBACK_STATS: u32 = comp_def_offset("init_feedback_stats");
const COMP_DEF_OFFSET_SUBMIT_FEEDBACK: u32 = comp_def_offset("submit_feedback");
const COMP_DEF_OFFSET_REVEAL_FEEDBACK_STATS: u32 = comp_def_offset("reveal_feedback_stats");

declare_id!("6CnTSKtXp2eUfGg4mPqTu1TkpUTiJ1BNiqG8c8yuUE47");

#[arcium_program]
pub mod encrypted_opinion_mpc {
    use super::*;

    // Initialize computation definitions
    pub fn init_init_vote_stats_comp_def(ctx: Context<InitInitVoteStatsCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_vote_comp_def(ctx: Context<InitVoteCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_reveal_result_comp_def(ctx: Context<InitRevealResultCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_init_opinion_stats_comp_def(ctx: Context<InitInitOpinionStatsCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_submit_opinion_comp_def(ctx: Context<InitSubmitOpinionCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_reveal_opinion_stats_comp_def(ctx: Context<InitRevealOpinionStatsCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_init_feedback_stats_comp_def(ctx: Context<InitInitFeedbackStatsCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_submit_feedback_comp_def(ctx: Context<InitSubmitFeedbackCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_reveal_feedback_stats_comp_def(ctx: Context<InitRevealFeedbackStatsCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    // Initialize vote statistics
    pub fn init_vote_stats(
        ctx: Context<InitVoteStats>,
        _poll_id: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![];

        queue_computation(
            ctx.accounts,
            0, // computation_offset
            args,
            None,
            vec![InitVoteStatsCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Submit vote
    pub fn vote(
        ctx: Context<Vote>,
        computation_offset: u64,
        _poll_id: u64,
        ciphertext_vote: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::EncryptedBool(ciphertext_vote),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![VoteCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Reveal result
    pub fn reveal_result(
        ctx: Context<RevealResult>,
        computation_offset: u64,
        _poll_id: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![RevealResultCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Initialize opinion statistics
    pub fn init_opinion_stats(
        ctx: Context<InitOpinionStats>,
        _opinion_id: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![];

        queue_computation(
            ctx.accounts,
            0, // computation_offset
            args,
            None,
            vec![InitOpinionStatsCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Submit opinion response
    pub fn submit_opinion_response(
        ctx: Context<SubmitOpinionResponse>,
        computation_offset: u64,
        _opinion_id: u64,
        ciphertext_rating: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::EncryptedU8(ciphertext_rating),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![SubmitOpinionCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Reveal opinion statistics
    pub fn reveal_opinion_stats(
        ctx: Context<RevealOpinionStats>,
        computation_offset: u64,
        _opinion_id: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![RevealOpinionStatsCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Create a new opinion post
    pub fn create_opinion_post(
        ctx: Context<CreateOpinionPost>,
        post_id: u64,
        encrypted_title: [u8; 32],
        encrypted_content: [u8; 128],
        encrypted_topic: [u8; 16],
    ) -> Result<()> {
        let post = &mut ctx.accounts.post_account;
        post.post_id = post_id;
        post.encrypted_title = encrypted_title;
        post.encrypted_content = encrypted_content;
        post.encrypted_topic = encrypted_topic;
        post.author = ctx.accounts.author.key();
        post.created_at = ctx.accounts.clock.unix_timestamp;
        post.total_comments = 0;
        post.total_feedback = 0;

        emit!(OpinionPostCreatedEvent {
            post_id,
            author: ctx.accounts.author.key(),
        });

        Ok(())
    }

    // Add a comment to an opinion post
    pub fn add_comment(
        ctx: Context<AddComment>,
        comment_id: u64,
        encrypted_content: [u8; 64],
    ) -> Result<()> {
        let comment = &mut ctx.accounts.comment_account;
        comment.comment_id = comment_id;
        comment.post_id = ctx.accounts.post_account.post_id;
        comment.encrypted_content = encrypted_content;
        comment.author = ctx.accounts.author.key();
        comment.created_at = ctx.accounts.clock.unix_timestamp;

        // Increment comment count on post
        let post = &mut ctx.accounts.post_account;
        post.total_comments += 1;

        emit!(CommentAddedEvent {
            comment_id,
            post_id: post.post_id,
            author: ctx.accounts.author.key(),
        });

        Ok(())
    }

    // Initialize feedback statistics for a post
    pub fn init_feedback_stats(
        ctx: Context<InitFeedbackStats>,
        _post_id: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![];

        queue_computation(
            ctx.accounts,
            0, // computation_offset
            args,
            None,
            vec![InitFeedbackStatsCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Submit feedback response for a post
    pub fn submit_feedback_response(
        ctx: Context<SubmitFeedbackResponse>,
        computation_offset: u64,
        _post_id: u64,
        ciphertext_rating: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::EncryptedU8(ciphertext_rating),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![SubmitFeedbackCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Reveal feedback statistics for a post
    pub fn reveal_feedback_stats(
        ctx: Context<RevealFeedbackStats>,
        computation_offset: u64,
        _post_id: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![RevealFeedbackStatsCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    // Callbacks for MPC computation results
    #[arcium_callback(encrypted_ix = "init_vote_stats")]
    pub fn init_vote_stats_callback(
        ctx: Context<InitVoteStatsCallback>,
        output: ComputationOutputs<InitVoteStatsOutput>,
    ) -> Result<()> {
        let _stats = match output {
            ComputationOutputs::Success(InitVoteStatsOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        // Vote stats initialized successfully
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "vote")]
    pub fn vote_callback(
        ctx: Context<VoteCallback>,
        output: ComputationOutputs<VoteOutput>,
    ) -> Result<()> {
        let _updated_stats = match output {
            ComputationOutputs::Success(VoteOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(VoteSubmittedEvent {
            poll_id: ctx.accounts.poll_account.poll_id,
            submitter: ctx.accounts.submitter.key(),
        });

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "reveal_result")]
    pub fn reveal_result_callback(
        ctx: Context<RevealResultCallback>,
        output: ComputationOutputs<RevealResultOutput>,
    ) -> Result<()> {
        let result = match output {
            ComputationOutputs::Success(RevealResultOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(PollResultRevealedEvent {
            poll_id: ctx.accounts.poll_account.poll_id,
            majority_yes: result,
        });

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "init_opinion_stats")]
    pub fn init_opinion_stats_callback(
        ctx: Context<InitOpinionStatsCallback>,
        output: ComputationOutputs<InitOpinionStatsOutput>,
    ) -> Result<()> {
        let _stats = match output {
            ComputationOutputs::Success(InitOpinionStatsOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        // Opinion stats initialized successfully
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "submit_opinion")]
    pub fn submit_opinion_callback(
        ctx: Context<SubmitOpinionCallback>,
        output: ComputationOutputs<SubmitOpinionOutput>,
    ) -> Result<()> {
        let _updated_stats = match output {
            ComputationOutputs::Success(SubmitOpinionOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(OpinionSubmittedEvent {
            opinion_id: ctx.accounts.opinion_account.opinion_id,
            submitter: ctx.accounts.submitter.key(),
        });

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "reveal_opinion_stats")]
    pub fn reveal_opinion_stats_callback(
        ctx: Context<RevealOpinionStatsCallback>,
        output: ComputationOutputs<RevealOpinionStatsOutput>,
    ) -> Result<()> {
        let stats = match output {
            ComputationOutputs::Success(RevealOpinionStatsOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(OpinionStatsRevealedEvent {
            opinion_id: ctx.accounts.opinion_account.opinion_id,
            total_responses: stats.field_0,
            average_rating: ((stats.field_1 * 10) / stats.field_0.max(1)) as u8,
            rating_distribution: stats.field_2,
        });

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "init_feedback_stats")]
    pub fn init_feedback_stats_callback(
        ctx: Context<InitFeedbackStatsCallback>,
        output: ComputationOutputs<InitFeedbackStatsOutput>,
    ) -> Result<()> {
        let _stats = match output {
            ComputationOutputs::Success(InitFeedbackStatsOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        // Feedback stats initialized successfully
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "submit_feedback")]
    pub fn submit_feedback_callback(
        ctx: Context<SubmitFeedbackCallback>,
        output: ComputationOutputs<SubmitFeedbackOutput>,
    ) -> Result<()> {
        let _updated_stats = match output {
            ComputationOutputs::Success(SubmitFeedbackOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(FeedbackSubmittedEvent {
            post_id: ctx.accounts.post_account.post_id,
            submitter: ctx.accounts.submitter.key(),
        });

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "reveal_feedback_stats")]
    pub fn reveal_feedback_stats_callback(
        ctx: Context<RevealFeedbackStatsCallback>,
        output: ComputationOutputs<RevealFeedbackStatsOutput>,
    ) -> Result<()> {
        let stats = match output {
            ComputationOutputs::Success(RevealFeedbackStatsOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(FeedbackStatsRevealedEvent {
            post_id: ctx.accounts.post_account.post_id,
            total_feedback: stats.field_0,
            average_rating: ((stats.field_1 * 10) / stats.field_0.max(1)) as u8,
            rating_distribution: stats.field_2,
        });

        Ok(())
    }

#[account]
pub struct PollAccount {
    pub poll_id: u64,
    pub question: String,
    pub created_at: i64,
}

#[account]
pub struct OpinionAccount {
    pub opinion_id: u64,
    pub title: String,
    pub content_hash: [u8; 32],
    pub created_at: i64,
    pub deadline: i64,
    pub total_responses: u32,
}

#[account]
pub struct OpinionPostAccount {
    pub post_id: u64,
    pub encrypted_title: [u8; 32],
    pub encrypted_content: [u8; 128],
    pub encrypted_topic: [u8; 16],
    pub author: Pubkey,
    pub created_at: i64,
    pub total_comments: u32,
    pub total_feedback: u32,
}

#[account]
pub struct CommentAccount {
    pub comment_id: u64,
    pub post_id: u64,
    pub encrypted_content: [u8; 64],
    pub author: Pubkey,
    pub created_at: i64,
}

#[account]
pub struct FeedbackStatsAccount {
    pub post_id: u64,
    pub total_feedback: u32,
    pub average_rating: u8,
    pub rating_distribution: [u32; 5],
}

#[derive(Accounts)]
#[instruction(post_id: u64)]
pub struct CreateOpinionPost<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + 8 + 32 + 128 + 16 + 32 + 8 + 4 + 4,
        seeds = [b"opinion_post", post_id.to_le_bytes().as_ref()],
        bump
    )]
    pub post_account: Account<'info, OpinionPostAccount>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(comment_id: u64)]
pub struct AddComment<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + 8 + 8 + 64 + 32 + 8,
        seeds = [b"comment", comment_id.to_le_bytes().as_ref()],
        bump
    )]
    pub comment_account: Account<'info, CommentAccount>,
    #[account(mut)]
    pub post_account: Account<'info, OpinionPostAccount>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

// Account structures - Voting
#[queue_computation_accounts("init_vote_stats", payer)]
#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitVoteStats<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(0u64)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_VOTE_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[queue_computation_accounts("vote", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, poll_id: u64)]
pub struct Vote<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_VOTE)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    pub poll_account: Account<'info, PollAccount>,
    pub submitter: Signer<'info>,
}

#[queue_computation_accounts("reveal_result", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, poll_id: u64)]
pub struct RevealResult<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_RESULT)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    pub poll_account: Account<'info, PollAccount>,
}

// Account structures - Opinions
#[queue_computation_accounts("init_opinion_stats", payer)]
#[derive(Accounts)]
#[instruction(opinion_id: u64)]
pub struct InitOpinionStats<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(0u64)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_OPINION_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[queue_computation_accounts("submit_opinion", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, opinion_id: u64)]
pub struct SubmitOpinionResponse<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_SUBMIT_OPINION)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    pub opinion_account: Account<'info, OpinionAccount>,
    pub submitter: Signer<'info>,
}

#[queue_computation_accounts("reveal_opinion_stats", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, opinion_id: u64)]
pub struct RevealOpinionStats<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_OPINION_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    pub opinion_account: Account<'info, OpinionAccount>,
}

// Feedback account structures
#[queue_computation_accounts("init_feedback_stats", payer)]
#[derive(Accounts)]
#[instruction(post_id: u64)]
pub struct InitFeedbackStats<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(0u64)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_FEEDBACK_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[queue_computation_accounts("submit_feedback", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, post_id: u64)]
pub struct SubmitFeedbackResponse<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_SUBMIT_FEEDBACK)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    pub post_account: Account<'info, OpinionPostAccount>,
    pub submitter: Signer<'info>,
}

#[queue_computation_accounts("reveal_feedback_stats", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64, post_id: u64)]
pub struct RevealFeedbackStats<'info> {
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
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_FEEDBACK_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
    pub post_account: Account<'info, OpinionPostAccount>,
}

// Callback account structures
#[callback_accounts("init_vote_stats")]
#[derive(Accounts)]
pub struct InitVoteStatsCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_VOTE_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("vote")]
#[derive(Accounts)]
pub struct VoteCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_VOTE)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    pub poll_account: Account<'info, PollAccount>,
    pub submitter: Signer<'info>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("reveal_result")]
#[derive(Accounts)]
pub struct RevealResultCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_RESULT)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    pub poll_account: Account<'info, PollAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("init_opinion_stats")]
#[derive(Accounts)]
pub struct InitOpinionStatsCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_OPINION_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("submit_opinion")]
#[derive(Accounts)]
pub struct SubmitOpinionCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_SUBMIT_OPINION)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    pub opinion_account: Account<'info, OpinionAccount>,
    pub submitter: Signer<'info>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("reveal_opinion_stats")]
#[derive(Accounts)]
pub struct RevealOpinionStatsCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_OPINION_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    pub opinion_account: Account<'info, OpinionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("init_feedback_stats")]
#[derive(Accounts)]
pub struct InitFeedbackStatsCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_INIT_FEEDBACK_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("submit_feedback")]
#[derive(Accounts)]
pub struct SubmitFeedbackCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_SUBMIT_FEEDBACK)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    pub post_account: Account<'info, OpinionPostAccount>,
    pub submitter: Signer<'info>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[callback_accounts("reveal_feedback_stats")]
#[derive(Accounts)]
pub struct RevealFeedbackStatsCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_FEEDBACK_STATS)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    pub post_account: Account<'info, OpinionPostAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

// Init computation definition account structures
#[init_computation_definition_accounts("init_vote_stats", payer)]
#[derive(Accounts)]
pub struct InitInitVoteStatsCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("vote", payer)]
#[derive(Accounts)]
pub struct InitVoteCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("reveal_result", payer)]
#[derive(Accounts)]
pub struct InitRevealResultCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("init_opinion_stats", payer)]
#[derive(Accounts)]
pub struct InitInitOpinionStatsCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("submit_opinion", payer)]
#[derive(Accounts)]
pub struct InitSubmitOpinionCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("reveal_opinion_stats", payer)]
#[derive(Accounts)]
pub struct InitRevealOpinionStatsCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("init_feedback_stats", payer)]
#[derive(Accounts)]
pub struct InitInitFeedbackStatsCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("submit_feedback", payer)]
#[derive(Accounts)]
pub struct InitSubmitFeedbackCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("reveal_feedback_stats", payer)]
#[derive(Accounts)]
pub struct InitRevealFeedbackStatsCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, initialized by the arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

// Events
#[event]
pub struct VoteSubmittedEvent {
    pub poll_id: u64,
    pub submitter: Pubkey,
}

#[event]
pub struct PollResultRevealedEvent {
    pub poll_id: u64,
    pub majority_yes: bool,
}

#[event]
pub struct OpinionSubmittedEvent {
    pub opinion_id: u64,
    pub submitter: Pubkey,
}

#[event]
pub struct OpinionStatsRevealedEvent {
    pub opinion_id: u64,
    pub total_responses: u32,
    pub average_rating: u8,
    pub rating_distribution: [u32; 5],
}

#[event]
pub struct OpinionPostCreatedEvent {
    pub post_id: u64,
    pub author: Pubkey,
}

#[event]
pub struct CommentAddedEvent {
    pub comment_id: u64,
    pub post_id: u64,
    pub author: Pubkey,
}

#[event]
pub struct FeedbackSubmittedEvent {
    pub post_id: u64,
    pub submitter: Pubkey,
}

#[event]
pub struct FeedbackStatsRevealedEvent {
    pub post_id: u64,
    pub total_feedback: u32,
    pub average_rating: u8,
    pub rating_distribution: [u32; 5],
}

#[error_code]
pub enum ErrorCode {
    #[msg("The computation was aborted")]
    AbortedComputation,
    #[msg("Cluster not set")]
    ClusterNotSet,
}
}
