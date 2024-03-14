import { ProposalStatusEnum } from "@/constants";
import { ProposalAction } from "soroban-governor-js-sdk";

/**
 * Interface for a governace proposal
 */
export interface Proposal {
  /**
   * The proposal id
   */
  id: number;
  /**
   * The proposal status
   */
  status: ProposalStatusEnum;
  /**
   * The function to call on execution, encoded as base64 XDR
   */
  /**
   * The description of the proposal
   */
  description: string;
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
  title: string;
  link: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  governor: string;
  action:ProposalAction
}

export interface GovernorSettings {
 /**
   * The votes required to create a proposal.
   */
 proposalThreshold: bigint;
 /**
  * The delay (in seconds) from the proposal creation to when the voting period begins. The voting period start time will be the checkpoint used to account for all votes for the proposal.
  */
 voteDelay: bigint;
 /**
  * The time (in seconds) the proposal will be open to vote against.
  */
 votePeriod: bigint;
 /**
  * The time (in seconds) the proposal will have to wait between vote period closing and execution.
  */
 timelock: bigint;
 /**
  * The percentage of votes (expressed in BPS) needed of the total available votes to consider a vote successful.
  */
 quorum: number;
 /**
  * Determine which votes to count against the quorum out of for, against, and abstain. The value is encoded such that only the last 3 bits are considered, and follows the structure `MSB...{for}{against}{abstain}`, such that any value != 0 means that type of vote is counted in the quorum. For example, consider 5 == `0x0...0101`, this means that votes "for" and "abstain" are included in the quorum, but votes "against" are not.
  */
 countingType: number;
 /**
  * The percentage of votes "yes" (expressed in BPS) needed to consider a vote successful.
  */
 voteThreshold: number;
    council: string;
gracePeriod:number

}


/**
 * Interface for the Governor contract
 */
export interface Governor {
 
  /**
   * The list of proposals
   *
   * TODO: Is this a map or an array?
   */

  name: string;
  memberCount: number;
  logo: string;
  address: string;
  voteTokenAddress: string;
  settings: GovernorSettings;
 
}

/**
 * Interface for the Token Votes contract
 */
interface Votes {
  totalSupply: bigint;

  /**
   * Get the number of votes for a proposal
   * @param proposal - The proposal to get the votes for
   * @param address - The address to get the votes for
   * @returns The number of votes they have for the proposal
   */
  getVotes(proposal: Proposal, address: any): bigint;
}

interface UserVotes {
  /**
   * The user's balance of assets in the token voting contract
   */
  balance: bigint;
  /**
   * The user's current voting power
   */
  votingPower: bigint;
  /**
   * Who the user is delegating their votes to
   */
  delegate: any;
  address: string;
  choice: string;
}

export interface Vote {
  proposal_id: string;
  support: number;
  amount: bigint;
  voter: string;
}


export enum VoteSupport {
  For = 1,
  Against = 0,
  Abstain = 2,

}

export interface XDRProposal  {
  "contract": string;
  "propNum": string;
  "title": string;
  "descr": string;
  "action": string;
  "creator": string;
  "status": string;
  "ledger": string;
}