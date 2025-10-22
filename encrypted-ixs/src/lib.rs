use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    /// Tracks the encrypted vote tallies for a poll.
    pub struct VoteStats {
        yes: u64,
        no: u64,
    }

    /// Represents a single encrypted vote.
    pub struct UserVote {
        vote: bool,
    }

    /// Tracks aggregated opinion statistics (1-5 ratings)
    pub struct OpinionStats {
        total_responses: u32,
        sum_ratings: u32,
        rating_counts: [u32; 5], // Count for each rating 1-5
    }

    /// Represents a single encrypted opinion response
    pub struct OpinionResponse {
        rating: u8,  // 1-5 rating
    }

    /// Represents a single encrypted feedback response
    pub struct FeedbackResponse {
        rating: u8,  // 1-5 rating for posts
    }

    /// Tracks aggregated feedback statistics for an opinion post
    pub struct FeedbackStats {
        total_feedback: u32,
        sum_ratings: u32,
        rating_counts: [u32; 5],  // Counts for 1-5 ratings
    }

    /// Initializes encrypted vote counters for a new poll.
    ///
    /// Creates a VoteStats structure with zero counts for both yes and no votes.
    /// The counters remain encrypted and can only be updated through MPC operations.
    #[instruction]
    pub fn init_vote_stats(mxe: Mxe) -> Enc<Mxe, VoteStats> {
        let vote_stats = VoteStats { yes: 0, no: 0 };
        mxe.from_arcis(vote_stats)
    }

    /// Processes an encrypted vote and updates the running tallies.
    ///
    /// Takes an individual vote and adds it to the appropriate counter (yes or no)
    /// without revealing the vote value. The updated vote statistics remain encrypted
    /// and can only be revealed by the poll authority.
    ///
    /// # Arguments
    /// * `vote_ctxt` - The encrypted vote to be counted
    /// * `vote_stats_ctxt` - Current encrypted vote tallies
    ///
    /// # Returns
    /// Updated encrypted vote statistics with the new vote included
    #[instruction]
    pub fn vote(
        vote_ctxt: Enc<Shared, UserVote>,
        vote_stats_ctxt: Enc<Mxe, VoteStats>,
    ) -> Enc<Mxe, VoteStats> {
        let user_vote = vote_ctxt.to_arcis();
        let mut vote_stats = vote_stats_ctxt.to_arcis();

        // Increment appropriate counter based on vote value
        if user_vote.vote {
            vote_stats.yes += 1;
        } else {
            vote_stats.no += 1;
        }

        vote_stats_ctxt.owner.from_arcis(vote_stats)
    }

    /// Reveals the final result of the poll by comparing vote tallies.
    ///
    /// Decrypts the vote counters and determines whether the majority voted yes or no.
    /// Only the final result (majority decision) is revealed, not the actual vote counts.
    ///
    /// # Arguments
    /// * `vote_stats_ctxt` - Encrypted vote tallies to be revealed
    ///
    /// # Returns
    /// * `true` if more people voted yes than no
    /// * `false` if more people voted no than yes (or tie)
    #[instruction]
    pub fn reveal_result(vote_stats_ctxt: Enc<Mxe, VoteStats>) -> bool {
        let vote_stats = vote_stats_ctxt.to_arcis();
        (vote_stats.yes > vote_stats.no).reveal()
    }

    /// Initializes encrypted opinion statistics for a new opinion poll
    #[instruction]
    pub fn init_opinion_stats(mxe: Mxe) -> Enc<Mxe, OpinionStats> {
        let stats = OpinionStats {
            total_responses: 0,
            sum_ratings: 0,
            rating_counts: [0; 5],
        };
        mxe.from_arcis(stats)
    }

    /// Processes an encrypted opinion response and updates the statistics
    #[instruction]
    pub fn submit_opinion(
        response_ctxt: Enc<Shared, OpinionResponse>,
        stats_ctxt: Enc<Mxe, OpinionStats>,
    ) -> Enc<Mxe, OpinionStats> {
        let response = response_ctxt.to_arcis();
        let mut stats = stats_ctxt.to_arcis();

        // Update total responses
        stats.total_responses += 1;
        stats.sum_ratings += response.rating as u32;

        // Update rating counts (convert 1-5 to 0-4 index)
        if response.rating >= 1 && response.rating <= 5 {
            stats.rating_counts[(response.rating - 1) as usize] += 1;
        }

        stats_ctxt.owner.from_arcis(stats)
    }

    /// Reveals the aggregated opinion statistics
    #[instruction]
    pub fn reveal_opinion_stats(stats_ctxt: Enc<Mxe, OpinionStats>) -> OpinionStats {
        let stats = stats_ctxt.to_arcis();
        stats.reveal()
    }

    /// Initializes encrypted feedback statistics for an opinion post
    #[instruction]
    pub fn init_feedback_stats(mxe: Mxe) -> Enc<Mxe, FeedbackStats> {
        let stats = FeedbackStats {
            total_feedback: 0,
            sum_ratings: 0,
            rating_counts: [0; 5],
        };
        mxe.from_arcis(stats)
    }

    /// Processes an encrypted feedback response and updates the statistics
    #[instruction]
    pub fn submit_feedback(
        feedback_ctxt: Enc<Shared, FeedbackResponse>,
        stats_ctxt: Enc<Mxe, FeedbackStats>,
    ) -> Enc<Mxe, FeedbackStats> {
        let feedback = feedback_ctxt.to_arcis();
        let mut stats = stats_ctxt.to_arcis();

        // Update total feedback
        stats.total_feedback += 1;
        stats.sum_ratings += feedback.rating as u32;

        // Update rating counts (1-5 to 0-4)
        if feedback.rating >= 1 && feedback.rating <= 5 {
            stats.rating_counts[(feedback.rating - 1) as usize] += 1;
        }

        stats_ctxt.owner.from_arcis(stats)
    }

    /// Reveals the aggregated feedback statistics
    #[instruction]
    pub fn reveal_feedback_stats(stats_ctxt: Enc<Mxe, FeedbackStats>) -> FeedbackStats {
        let stats = stats_ctxt.to_arcis();
        stats.reveal()
    }
}
