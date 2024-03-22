import { ProposalStatusEnum } from "@/constants";
import { GovernorSettings, ProposalAction } from "soroban-governor-js-sdk";

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





export interface Vote {
  proposal_id: string;
  support: number;
  amount: bigint;
  voter: string;
  governor: string;
  ledger: string;
}


export enum VoteSupport {
  For = 1,
  Against = 0,
  Abstain = 2,

}

export interface XDRProposal  {
  contract: string;
  propNum: string;
  title: string;
  descr: string;
  action: string;
  creator: string;
  status: string;
  vStart: string;
  vEnd: string;
  votes?: string;
}

export interface XDRVote {
   contract: string
   propNum: string
   voter: string
   support: string
   amount: string
   ledger: string
}