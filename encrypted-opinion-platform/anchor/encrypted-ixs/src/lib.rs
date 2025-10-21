use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    /// Tracks the encrypted opinion tallies for a post.
    pub struct OpinionStats {
        agree: u64,
        disagree: u64,
    }

    /// Represents a single encrypted opinion submission.
    pub struct OpinionVote {
        support: bool,
    }

    /// Initializes encrypted opinion counters for a new post.
    ///
    /// Creates an OpinionStats structure with zero counts for both agree and disagree.
    /// The counters remain encrypted and can only be updated through MPC operations.
    #[instruction]
    pub fn init_opinion_stats(mxe: Mxe) -> Enc<Mxe, OpinionStats> {
        let opinion_stats = OpinionStats {
            agree: 0,
            disagree: 0,
        };
        mxe.from_arcis(opinion_stats)
    }

    /// Processes an encrypted opinion and updates the running tallies.
    ///
    /// Takes an individual opinion and adds it to the appropriate counter (agree or disagree)
    /// without revealing the opinion value. The updated opinion statistics remain encrypted
    /// and can only be revealed by the post owner.
    ///
    /// # Arguments
    /// * `opinion_ctxt` - The encrypted opinion to be counted
    /// * `opinion_stats_ctxt` - Current encrypted opinion tallies
    ///
    /// # Returns
    /// Updated encrypted opinion statistics with the new opinion included
    #[instruction]
    pub fn submit_opinion(
        opinion_ctxt: Enc<Shared, OpinionVote>,
        opinion_stats_ctxt: Enc<Mxe, OpinionStats>,
    ) -> Enc<Mxe, OpinionStats> {
        let opinion = opinion_ctxt.to_arcis();
        let mut opinion_stats = opinion_stats_ctxt.to_arcis();

        // Increment appropriate counter based on opinion value
        if opinion.support {
            opinion_stats.agree += 1;
        } else {
            opinion_stats.disagree += 1;
        }

        opinion_stats_ctxt.owner.from_arcis(opinion_stats)
    }

    /// Reveals the final result of the opinion post by comparing tallies.
    ///
    /// Decrypts the opinion counters and determines whether the majority agreed or disagreed.
    /// Only the final result (majority decision) is revealed, not the actual opinion counts.
    ///
    /// # Arguments
    /// * `opinion_stats_ctxt` - Encrypted opinion tallies to be revealed
    ///
    /// # Returns
    /// * `true` if more people agreed than disagreed
    /// * `false` if more people disagreed than agreed (or tie)
    #[instruction]
    pub fn reveal_opinion(opinion_stats_ctxt: Enc<Mxe, OpinionStats>) -> bool {
        let opinion_stats = opinion_stats_ctxt.to_arcis();
        (opinion_stats.agree > opinion_stats.disagree).reveal()
    }
}
