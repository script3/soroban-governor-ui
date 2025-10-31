import { Proposal, Vote } from "@/types";
import { ProposalAction } from "@script3/soroban-governor-sdk";
import { scValToNative, xdr } from "@stellar/stellar-sdk";

export interface IndexerProposal {
  ProposalKey: string;
  ContractId: string;
  ProposalId: number;
  Proposer: string;
  Status: number;
  Title: string;
  Description: string;
  // Base-64 XDR encoded ScVal for ProposalAction
  Action: string;
  VoteStart: number;
  VoteEnd: number;
  VotesFor: string;
  VotesAgainst: string;
  VotesAbstain: string;
  ExecutionUnlock: number;
  ExecutionTxHash: string;
}

export interface IndexerVote {
  TxHash: string;
  ContractId: string;
  ProposalId: number;
  Voter: string;
  Support: number;
  Amount: string;
  LedgerSeq: number;
  LedgerCloseTime: number;
}

export interface HealthStatus {
  status: number;
}

class IndexerClient {
  private baseUrl: string;

  constructor(url: string) {
    this.baseUrl = url.replace(/\/$/, ""); // Remove trailing slash
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorString = await response
          .json()
          .catch(() => `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(errorString);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }

  /**
   * Check the health status of the service
   * @returns The current ledger sequence number
   * @errors If the request fails, or the service is unhealthy
   */
  async fetchHealth(): Promise<number> {
    const data = await this.request<HealthStatus>("/health");
    return data.status;
  }

  /**
   * Fetch a single proposal by contract ID and proposal ID
   * @param contractId - The contract ID
   * @param proposalId - The proposal ID
   * @returns The proposal data
   */
  async fetchProposal(
    contractId: string,
    proposalId: number
  ): Promise<Proposal> {
    const indexedProposal = await this.request<IndexerProposal>(
      `/${contractId}/proposals/${proposalId}`
    );
    return parseProposalFromIndexer(indexedProposal);
  }

  /**
   * Fetch all proposals for a contract
   * @param contractId - The contract ID
   * @returns Array of proposals
   */
  async fetchProposals(contractId: string): Promise<Proposal[]> {
    const indexedProposals = await this.request<IndexerProposal[]>(
      `/${contractId}/proposals`
    );
    return indexedProposals.map((p) => parseProposalFromIndexer(p));
  }

  /**
   * Fetch all votes for a specific proposal
   * @param contractId - The contract ID
   * @param proposalId - The proposal ID
   * @returns Array of votes
   */
  async fetchVotes(contractId: string, proposalId: number): Promise<Vote[]> {
    const indexedVotes = await this.request<IndexerVote[]>(
      `/${contractId}/proposals/${proposalId}/votes`
    );
    return indexedVotes.map((v) => parseVoteFromIndexer(v));
  }
}

export const indexer = new IndexerClient(process.env.NEXT_PUBLIC_API_ENDPOINT!);

function parseProposalFromIndexer(proposal: IndexerProposal): Proposal {
  let scval = xdr.ScVal.fromXDR(proposal.Action, "base64");
  let actionPropArray = scValToNative(scval);
  let action: ProposalAction;
  switch (actionPropArray[0]) {
    case "Snapshot": {
      action = { tag: actionPropArray[0], values: undefined };
      break;
    }
    case "Calldata":
    case "Upgrade":
    case "Settings":
    default: {
      action = { tag: actionPropArray[0], values: actionPropArray[1] };
      break;
    }
  }

  const proposalToReturn: Proposal = {
    id: proposal.ProposalId,
    title: proposal.Title,
    description: proposal.Description,
    action,
    proposer: proposal.Proposer,
    status: proposal.Status,
    vote_start: proposal.VoteStart,
    vote_end: proposal.VoteEnd,
    eta: proposal.ExecutionUnlock,
    vote_count: {
      _for: BigInt(proposal.VotesFor),
      against: BigInt(proposal.VotesAgainst),
      abstain: BigInt(proposal.VotesAbstain),
    },
    execution_hash: proposal.ExecutionTxHash,
  };
  return proposalToReturn;
}

function parseVoteFromIndexer(votes: IndexerVote): Vote {
  const voteToReturn: Vote = {
    voter: votes.Voter,
    support: votes.Support,
    amount: BigInt(votes.Amount),
    proposal_id: votes.ProposalId,
    governor: votes.ContractId,
    ledger: votes.LedgerSeq,
    tx_hash: votes.TxHash,
  };
  return voteToReturn;
}
