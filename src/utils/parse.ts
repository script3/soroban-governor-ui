import { Proposal, Vote, XDRProposal, XDRVote } from "@/types";
import { ProposalAction, VoteCount } from "@script3/soroban-governor-sdk";
import { StrKey, scValToNative, xdr } from "@stellar/stellar-sdk";

export function parseProposalFromXDR(proposal: XDRProposal): Proposal {
  let scval = xdr.ScVal.fromXDR(proposal.action, "base64");
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

  const vote_count: VoteCount | undefined =
    proposal.votes === "AAAAAQ==" // base64 encoding of ScVoid
      ? undefined
      : scValToNative(xdr.ScVal.fromXDR(proposal.votes, "base64"));
  const proposalToReturn: Proposal = {
    id: scValToNative(xdr.ScVal.fromXDR(proposal.propNum, "base64")),
    title: scValToNative(xdr.ScVal.fromXDR(proposal.title, "base64")),
    description: scValToNative(xdr.ScVal.fromXDR(proposal.descr, "base64")),
    action,
    proposer: scValToNative(xdr.ScVal.fromXDR(proposal.creator, "base64")),
    status: scValToNative(xdr.ScVal.fromXDR(proposal.status, "base64")),
    vote_start: scValToNative(xdr.ScVal.fromXDR(proposal.vStart, "base64")),
    vote_end: scValToNative(xdr.ScVal.fromXDR(proposal.vEnd, "base64")),
    eta:
      !!proposal.eta &&
      scValToNative(xdr.ScVal.fromXDR(proposal.eta, "base64")),
    vote_count: vote_count ?? {
      _for: BigInt(0),
      against: BigInt(0),
      abstain: BigInt(0),
    },
  };
  return proposalToReturn;
}

export function parseVoteFromXDR(vote: XDRVote): Vote {
  const voteToReturn = {
    voter: scValToNative(xdr.ScVal.fromXDR(vote.voter, "base64")),
    support: scValToNative(xdr.ScVal.fromXDR(vote.support, "base64")),
    amount: scValToNative(xdr.ScVal.fromXDR(vote.amount, "base64")),
    proposal_id: scValToNative(xdr.ScVal.fromXDR(vote.propNum, "base64")),
    governor: StrKey.encodeContract(xdr.Hash.fromXDR(vote.contract, "base64")),
    ledger: scValToNative(xdr.ScVal.fromXDR(vote.ledger, "base64")),
  };
  return voteToReturn;
}
