import { Proposal, Vote, XDRProposal, XDRVote } from "@/types";
import { StrKey, nativeToScVal } from "@stellar/stellar-sdk";
import { parseProposalFromXDR, parseVoteFromXDR } from "./parse";

const apiEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT as string;

/// Fetch against graphql and throw error if response is not ok
async function fetchGraphQL(query: string, variables: any): Promise<any> {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `GraphQL response was not ok: ${response.status} ${response.statusText}`
    );
  }

  try {
    return await response.json();
  } catch (e: any) {
    throw new Error(
      `Unable to parse JSON response from GraphQL: ${e?.message}`
    );
  }
}

/**
 * Fetch proposals by governor address
 * @param governorAddress - The governor contract address
 * @returns List of proposals
 * @throws If graphql response is not ok
 */
export async function fetchProposalsByGovernor(
  governorAddress: string
): Promise<Proposal[]> {
  const addressHash = StrKey.decodeContract(governorAddress).toString("base64");

  const data = await fetchGraphQL(
    `query getProposalsByGovernor { 
      ${process.env.NEXT_PUBLIC_PROPOSAL_TABLE}(hash: "${addressHash}") {
        nodes {
          contract
          propNum
          title
          descr
          action
          creator
          status
          eta
          vEnd
          vStart
          votes
        }
      }
    }`,
    "getProposalsByGovernor"
  );
  if (!data) {
    throw new Error("Unable to fetchProposalsByGovernor from GraphQL");
  }
  const xdr_proposals: XDRProposal[] | null | undefined =
    data[`${process.env.NEXT_PUBLIC_PROPOSAL_TABLE}`]?.nodes;
  if (!xdr_proposals) {
    throw new Error("Unable to fetchProposalsByGovernor from GraphQL");
  }
  let proposals: Proposal[] = [];
  for (const xdr_prop of xdr_proposals) {
    proposals.push(parseProposalFromXDR(xdr_prop));
  }
  return proposals;
}

/**
 * Fetch a proposal by governor address and proposal id
 * @param governorAddress - The governor contract address
 * @param proposalId - The proposal id
 * @returns The proposal
 * @throws if the graphql response is not ok
 */
export async function fetchProposalById(
  governorAddress: string,
  proposalId: number
): Promise<Proposal | undefined> {
  const addressHash = StrKey.decodeContract(governorAddress).toString("base64");
  const proposalNum = nativeToScVal(proposalId, { type: "u32" }).toXDR(
    "base64"
  );

  const data = await fetchGraphQL(
    `query getProposalsById { 
     ${process.env.NEXT_PUBLIC_PROPOSAL_BY_ID_TABLE}(hash: "${addressHash}", num: "${proposalNum}") { 
        nodes {
          contract
          propNum
          title
          descr
          action
          creator
          status
          eta
          vEnd
          vStart
          votes
        }
      }
    }`,
    "getProposalsById"
  );
  if (!data) {
    throw new Error(
      `Failed to query for proposal: ${governorAddress} ${proposalId}`
    );
  }
  const proposal =
    data[`${process.env.NEXT_PUBLIC_PROPOSAL_BY_ID_TABLE}`]?.nodes[0];
  if (!proposal) {
    return undefined;
  }
  return parseProposalFromXDR(proposal);
}

/**
 * Fetch votes from a proposal
 * @param governorAddress - The governor contract address
 * @param proposalId - The proposal id
 * @returns The votes
 * @throws if the graphql response is not ok
 */
export async function fetchVotesByProposal(
  governorAddress: string,
  proposalId: number
) {
  const addressHash = StrKey.decodeContract(governorAddress).toString("base64");
  const proposalNum = nativeToScVal(proposalId, { type: "u32" }).toXDR(
    "base64"
  );

  const data = await fetchGraphQL(
    `query getVotesByProposalId { 
    ${process.env.NEXT_PUBLIC_VOTES_TABLE}(hash: "${addressHash}", num: "${proposalNum}") { 
        nodes {
          contract
          propNum
          voter
          support
          amount
          ledger
        }
      }
    }`,
    "getVotesByProposalId"
  );
  if (!data) {
    throw new Error("Unable to fetchVotesByProposal from GraphQL");
  }
  const xdr_votes: XDRVote[] | null | undefined =
    data[`${process.env.NEXT_PUBLIC_VOTES_TABLE}`]?.nodes;
  if (!xdr_votes) {
    throw new Error("Unable to fetchVotesByProposal from GraphQL");
  }
  const votes: Vote[] = [];
  for (const xdr_vote of xdr_votes) {
    votes.push(parseVoteFromXDR(xdr_vote));
  }
  return votes;
}
