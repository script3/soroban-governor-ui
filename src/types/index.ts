import { ProposalAction, VoteCount } from "@script3/soroban-governor-sdk";
import { contract } from "@stellar/stellar-sdk";

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

export const oldSettingsSpec = new contract.Spec([
  "AAAAAAAAAAAAAAAIc2V0dGluZ3MAAAAAAAAAAQAAB9AAAAAQR292ZXJub3JTZXR0aW5ncw==",
  "AAAAAQAAACxUaGUgZ292ZXJub3Igc2V0dGluZ3MgZm9yIG1hbmFnaW5nIHByb3Bvc2FscwAAAAAAAAAQR292ZXJub3JTZXR0aW5ncwAAAAkAAACnVGhlIGFkZHJlc3Mgb2YgdGhlIHNlY3VyaXR5IGNvdW5jaWwgdGhhdCBjYW4gY2FuY2VsIHByb3Bvc2FscyBkdXJpbmcgdGhlIHZvdGUgZGVsYXkgcGVyaW9kLiBJZiB0aGUgREFPIGRvZXMgbm90CmhhdmUgYSBjb3VuY2lsLCB0aGlzIHNob3VsZCBiZSBzZXQgdG8gdGhlIHplcm8gYWRkcmVzcy4AAAAAB2NvdW5jaWwAAAAAEwAAAalEZXRlcm1pbmUgd2hpY2ggdm90ZXMgdG8gY291bnQgYWdhaW5zdCB0aGUgcXVvcnVtIG91dCBvZiBmb3IsIGFnYWluc3QsIGFuZCBhYnN0YWluLiBUaGUgdmFsdWUgaXMgZW5jb2RlZApzdWNoIHRoYXQgb25seSB0aGUgbGFzdCAzIGJpdHMgYXJlIGNvbnNpZGVyZWQsIGFuZCBmb2xsb3dzIHRoZSBzdHJ1Y3R1cmUgYE1TQi4uLnthZ2FpbnN0fXtmb3J9e2Fic3RhaW59YCwKc3VjaCB0aGF0IGFueSB2YWx1ZSAhPSAwIG1lYW5zIHRoYXQgdHlwZSBvZiB2b3RlIGlzIGNvdW50ZWQgaW4gdGhlIHF1b3J1bS4gRm9yIGV4YW1wbGUsIGNvbnNpZGVyCjUgPT0gYDB4MC4uLjAxMDFgLCB0aGlzIG1lYW5zIHRoYXQgdm90ZXMgImFnYWluc3QiIGFuZCAiYWJzdGFpbiIgYXJlIGluY2x1ZGVkIGluIHRoZSBxdW9ydW0sIGJ1dCB2b3RlcwoiZm9yIiBhcmUgbm90LgAAAAAAAA1jb3VudGluZ190eXBlAAAAAAAABAAAAGhUaGUgdGltZSAoaW4gbGVkZ2VycykgdGhlIHByb3Bvc2FsIGhhcyB0byBiZSBleGVjdXRlZCBiZWZvcmUgaXQgZXhwaXJlcy4gVGhpcyBzdGFydHMgYWZ0ZXIgdGhlIHRpbWVsb2NrLgAAAAxncmFjZV9wZXJpb2QAAAAEAAAAKFRoZSB2b3RlcyByZXF1aXJlZCB0byBjcmVhdGUgYSBwcm9wb3NhbC4AAAAScHJvcG9zYWxfdGhyZXNob2xkAAAAAAALAAAAbVRoZSBwZXJjZW50YWdlIG9mIHZvdGVzIChleHByZXNzZWQgaW4gQlBTKSBuZWVkZWQgb2YgdGhlIHRvdGFsIGF2YWlsYWJsZSB2b3RlcyB0byBjb25zaWRlciBhIHZvdGUgc3VjY2Vzc2Z1bC4AAAAAAAAGcXVvcnVtAAAAAAAEAAAAX1RoZSB0aW1lIChpbiBsZWRnZXJzKSB0aGUgcHJvcG9zYWwgd2lsbCBoYXZlIHRvIHdhaXQgYmV0d2VlbiB2b3RlIHBlcmlvZCBjbG9zaW5nIGFuZCBleGVjdXRpb24uAAAAAAh0aW1lbG9jawAAAAQAAAC3VGhlIGRlbGF5IChpbiBsZWRnZXJzKSBmcm9tIHRoZSBwcm9wb3NhbCBjcmVhdGlvbiB0byB3aGVuIHRoZSB2b3RpbmcgcGVyaW9kIGJlZ2lucy4gVGhlIHZvdGluZwpwZXJpb2Qgc3RhcnQgdGltZSB3aWxsIGJlIHRoZSBjaGVja3BvaW50IHVzZWQgdG8gYWNjb3VudCBmb3IgYWxsIHZvdGVzIGZvciB0aGUgcHJvcG9zYWwuAAAAAAp2b3RlX2RlbGF5AAAAAAAEAAAAQFRoZSB0aW1lIChpbiBsZWRnZXJzKSB0aGUgcHJvcG9zYWwgd2lsbCBiZSBvcGVuIHRvIHZvdGUgYWdhaW5zdC4AAAALdm90ZV9wZXJpb2QAAAAABAAAAFZUaGUgcGVyY2VudGFnZSBvZiB2b3RlcyAieWVzIiAoZXhwcmVzc2VkIGluIEJQUykgbmVlZGVkIHRvIGNvbnNpZGVyIGEgdm90ZSBzdWNjZXNzZnVsLgAAAAAADnZvdGVfdGhyZXNob2xkAAAAAAAE",
]);

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
  description?: string;
  logo: string;
  address: string;
  voteTokenAddress: string;
  voteTokenMetadata: TokenMetadata;
  decimals: number;
  isWrappedAsset: boolean;
  underlyingTokenAddress?: string;
  underlyingTokenMetadata?: TokenMetadata;
  supportedProposalTypes?: string[]
  delegation?: boolean
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
