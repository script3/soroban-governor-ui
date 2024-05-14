import { ProposalAction, VoteCount } from "@script3/soroban-governor-sdk";

export enum ProposalStatusExt {
  /**
   * The proposal exists and voting has not been closed
   */
  Open = 0,
  /**
   * The proposal was voted for. If the proposal is executable, the timelock begins once this state is reached.
   */
  Successful = 1,
  /**
   * The proposal was voted against
   */
  Defeated = 2,
  /**
   * The proposal did not reach quorum before the voting period ended
   */
  Expired = 3,
  /**
   * The proposal has been executed
   */
  Executed = 4,
  /**
   * The proposal has been canceled
   */
  Canceled = 5,
  /**
   * Frontend Only
   * The proposal is open but the vote start ledger has not been reached
   */
  Pending = 6,
  /**
   * Frontend Only
   * The proposal is open for voting
   */
  Active = 7,
}

export interface Proposal {
  /**
   * The proposal id
   */
  id: number;
  /**
   * The proposal status
   */
  status: ProposalStatusExt;
  /**
   * The title of the proposal
   */
  title: string;
  /**
   * The description of the proposal
   */
  description: string;
  /**
   * The action of the proposal
   */
  action: ProposalAction;
  /**
   * The user who created the proposal
   */
  proposer: string;
  /**
   * The ledger timestamp where votes will be fetched from and when voting can begin
   */
  vote_start: number;
  /**
   * The ledger timestamp voting will close at
   */
  vote_end: number;
  /**
   * The ledger the proposal can be executed
   */
  eta: number;
  /**
   * The current vote count
   */
  vote_count: VoteCount;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  issuer?: string;
  domain?: string;
}

export interface Governor {
  name: string;
  logo: string;
  address: string;
  voteTokenAddress: string;
  voteTokenMetadata: TokenMetadata;
  decimals: number;
  isWrappedAsset: boolean;
  underlyingTokenAddress?: string;
  underlyingTokenMetadata?: TokenMetadata;
}

export interface Vote {
  proposal_id: string;
  support: number;
  amount: bigint;
  voter: string;
  governor: string;
  ledger: string;
}

export enum VoteSupport {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export interface XDRProposal {
  contract: string;
  propNum: string;
  title: string;
  descr: string;
  action: string;
  creator: string;
  status: string;
  vStart: string;
  vEnd: string;
  votes: string;
  eta: string;
}

export interface XDRVote {
  contract: string;
  propNum: string;
  voter: string;
  support: string;
  amount: string;
  ledger: string;
}
