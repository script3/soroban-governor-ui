import { Proposal, XDRProposal } from "@/types";
import { ProposalAction } from "soroban-governor-js-sdk";
import { StrKey, scValToNative, xdr } from "stellar-sdk";

export function parseProposalFromXDR(proposal: XDRProposal, voteDelay: bigint, votePeriod: bigint): Proposal {
    let contract = xdr.Hash.fromXDR(
        proposal.contract,
        "base64"
    );
    let governor = StrKey.encodeContract(contract);
    let scval = xdr.ScVal.fromXDR(
        proposal.action,
        "base64"
    );
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
        default:
            {
                action = { tag: actionPropArray[0], values: actionPropArray[1] };
                break;
            }
    }

    const proposalToReturn: Proposal = {
        governor,
        id: scValToNative(xdr.ScVal.fromXDR(proposal.propNum, "base64")),
        title: scValToNative(xdr.ScVal.fromXDR(proposal.title, "base64")),
        description: scValToNative(xdr.ScVal.fromXDR(proposal.descr, "base64")),
        action,
        proposer: scValToNative(xdr.ScVal.fromXDR(proposal.creator, "base64")),
        status: scValToNative(xdr.ScVal.fromXDR(proposal.status, "base64")),
        vote_start: scValToNative(xdr.ScVal.fromXDR(proposal.ledger, "base64")) + Number(voteDelay),
        vote_end: scValToNative(xdr.ScVal.fromXDR(proposal.ledger, "base64")) + Number(voteDelay) + Number(votePeriod),
        link: "",
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        total_votes: 0,
    };

    return proposalToReturn
}

export function parseVoteFromXDR() {

}