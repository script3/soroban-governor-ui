import { Governor, Proposal, Vote, VoteSupport, XDRVote } from "@/types";
import { DefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useWallet } from "./wallet";
import governors from "../../public/governors/governors.json";
import { parseProposalFromXDR, parseVoteFromXDR } from "@/utils/parse";
import { SorobanRpc, StrKey, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { VoteCount } from "@script3/soroban-governor-sdk";
const apiEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT as string;
const mappedGovernors = governors.map(
  ({ settings: { proposal_threshold, ...settings }, ...rest }) => {
    return {
      ...rest,
      settings: {
        ...settings,
        proposal_threshold: BigInt(proposal_threshold),
      },
    };
  }
);
const DEFAULT_STALE_TIME = 20 * 1000;

export function useCurrentBlockNumber(
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { network } = useWallet();
  const { data, isLoading, error } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 10000,
    queryKey: ["blockNumber"],
    queryFn: async () => {
      const rpc = new SorobanRpc.Server(network.rpc);
      const data = await rpc.getLatestLedger();
      return data.sequence;
    },
  });

  return {
    blockNumber: data as number,
    isLoading,
    error,
  };
}

export function useGovernors(
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["governors"],
    queryFn: loadGovernors,
  });
  async function loadGovernors(): Promise<Governor[]> {
    return mappedGovernors as Governor[];
  }
  return {
    governors: data as Governor[],
    isLoading,
    error,
  };
}

export function useGovernor(
  governorId: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["governor", governorId],
    queryFn: () => getGovernorById(governorId),
  });
  function getGovernorById(governorId: string) {
    const foundGovernor = mappedGovernors.find((p) => p.address === governorId);
    return foundGovernor || null;
  }

  return {
    governor: data as Governor,
    isLoading,
    error,
  };
}

export function useProposals(
  governorAddress: string,
  voteDelay: number,
  votePeriod: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getTotalVotesByProposal } = useWallet();
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["proposals", governorAddress],
    queryFn: async () =>
      loadProposalsByDaoId(governorAddress, voteDelay, votePeriod),
  });
  async function loadProposalsByDaoId(
    daoId: string,
    voteDelay: number,
    votePeriod: number
  ): Promise<Proposal[]> {
    const proposals = await getProposalsByGovernor(daoId);

    let proposalsToReturn: Proposal[] = [];
    for (let proposal of proposals) {
      const data = parseProposalFromXDR(proposal, voteDelay, votePeriod);
      // get proposal votes from contract
      const voteCount = (await getTotalVotesByProposal(
        data.id,
        governorAddress
      )) as VoteCount;

      if (voteCount?._for !== undefined) {
        data.votes_for = Number(voteCount._for);
        data.total_votes = Number(
          voteCount._for + voteCount.against + voteCount.abstain
        );
        data.votes_abstain = Number(voteCount.abstain);
        data.votes_against = Number(voteCount.against);
        proposalsToReturn.push(data);
      }
    }
    return proposalsToReturn.sort(({ id: a }, { id: b }) => b - a);
  }
  return {
    proposals: data as Proposal[],
    isLoading,
    error,
  };
}

export function useProposal(
  proposalId: number,
  governorAddress: string,
  voteDelay: number,
  votePeriod: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getTotalVotesByProposal } = useWallet();
  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["proposal", proposalId],
    queryFn: async () => {
      return await getProposalByIdWithVoteCount(
        proposalId,
        governorAddress,
        voteDelay,
        votePeriod
      );
    },
  });
  async function getProposalByIdWithVoteCount(
    proposalId: number,
    governorAddress: string,
    voteDelay: number,
    votePeriod: number
  ) {
    const data = await getProposalById(
      proposalId,
      governorAddress,
      voteDelay,
      votePeriod
    );
    if (!data) {
      return null;
    }

    // get proposal votes from contract
    const voteCount = (await getTotalVotesByProposal(
      proposalId,
      governorAddress
    )) as VoteCount;

    if (voteCount?._for) {
      data.votes_for = Number(voteCount._for);
      data.total_votes = Number(
        voteCount._for + voteCount.against + voteCount.abstain
      );
      data.votes_abstain = Number(voteCount.abstain);
      data.votes_against = Number(voteCount.against);
    }
    return data;
  }

  return {
    proposal: proposal as Proposal,
    isLoading,
    error,
    refetch,
  };
}

export function useVotes(
  proposalId: number,
  governorAddress: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const {
    data: votes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["votes", proposalId],
    queryFn: async () => getVotesByProposalId(proposalId, governorAddress),
  });

  return {
    votes: votes as Vote[],
    isLoading,
    error,
    refetch,
  };
}

export function useVoteTokenBalance(
  voteTokenAddress: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getVoteTokenBalance, connected } = useWallet();
  const { data, isLoading, error, refetch } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["voteTokenBalance", voteTokenAddress, connected],
    queryFn: async () => {
      const result = await getVoteTokenBalance(voteTokenAddress, true);
      return result || BigInt(0);
    },
  });
  return {
    balance: data as bigint,
    isLoading,
    error,
    refetch,
  };
}

export function useVotingPowerByProposal(
  voteTokenAddress: string,
  proposalStartTime: number,
  proposalId: number,
  currentBlockNumber: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getVotingPowerByProposal, connected } = useWallet();
  const { data, isLoading, error } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    queryKey: [
      "votingPowerByProposal",
      proposalId,
      proposalStartTime,
      connected,
    ],
    queryFn: async () => {
      const result = await getVotingPowerByProposal(
        voteTokenAddress,
        proposalStartTime,
        currentBlockNumber,
        true
      );

      return result || BigInt(0);
    },
  });
  return {
    votingPower: data as bigint,
    isLoading,
    error,
  };
}

export function useUserVoteByProposalId(
  proposalId: number,
  governorAddress: string,

  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getUserVoteByProposalId, connected } = useWallet();
  const { data, isLoading, error } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,

    queryKey: ["userVoteByProposalId", proposalId, connected],
    queryFn: async () => {
      const result = await getUserVoteByProposalId(
        proposalId,
        governorAddress,
        true
      );

      /** this is done because useQuery doesnt accept functions that return undefined values  */
      return result === undefined ? null : result;
    },
  });

  return {
    /** if value is null set as undefined to prevent having to do null handling */
    userVote: data === null ? undefined : (data as VoteSupport),
    isLoading,
    error,
  };
}

export function useUnderlyingTokenBalance(
  underlyingTokenAddress: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getTokenBalance, connected } = useWallet();
  const { data, isLoading, error, refetch } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["underlyingTokenBalance", underlyingTokenAddress, connected],
    queryFn: async () => {
      const result = await getTokenBalance(underlyingTokenAddress);
      return result || BigInt(0);
    },
  });
  return {
    balance: data as bigint,
    isLoading,
    error,
    refetch,
  };
}

export function useDelegate(
  voteTokenAddress: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getDelegate, connected, walletAddress } = useWallet();
  const { data, isLoading, error, refetch } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["delegate", voteTokenAddress, connected],
    queryFn: async () => {
      const result = await getDelegate(voteTokenAddress, true);
      return result;
    },
  });
  return {
    delegateAddress: data as string,
    isLoading,
    error,
    refetch,
  };
}

async function getProposalsByGovernor(governorAddress: string) {
  try {
    const addressHash =
      StrKey.decodeContract(governorAddress).toString("base64");

    const data = await runGraphQLQuery(
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
      return null;
    }
    const proposals = data[`${process.env.NEXT_PUBLIC_PROPOSAL_TABLE}`]?.nodes;
    return proposals;
  } catch (e) {
    console.error(e);
    return null;
  }
}
async function getProposalById(
  proposalId: number,
  governorAddress: string,
  voteDelay: number,
  votePeriod: number
) {
  try {
    const addressHash =
      StrKey.decodeContract(governorAddress).toString("base64");

    const proposalNum = nativeToScVal(proposalId, { type: "u32" }).toXDR(
      "base64"
    );

    const data = await runGraphQLQuery(
      `query getProposalsById { 
     ${process.env.NEXT_PUBLIC_PROPOSAL_BY_ID_TABLE}(hash: "${addressHash}", num: "${proposalNum}") { nodes {
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
      return null;
    }
    const proposal =
      data[`${process.env.NEXT_PUBLIC_PROPOSAL_BY_ID_TABLE}`]?.nodes[0];
    return parseProposalFromXDR(proposal, voteDelay, votePeriod);
  } catch (e) {
    console.error(e);
    return null;
  }
}
async function getVotesByProposalId(
  proposalId: number,
  governorAddress: string
) {
  try {
    const addressHash =
      StrKey.decodeContract(governorAddress).toString("base64");

    const proposalNum = nativeToScVal(proposalId, { type: "u32" }).toXDR(
      "base64"
    );

    const data = await runGraphQLQuery(
      `query getVotesByProposalId { 
    ${process.env.NEXT_PUBLIC_VOTES_TABLE}(hash: "${addressHash}", num: "${proposalNum}") { nodes {
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
      return null;
    }
    const votes = data[`${process.env.NEXT_PUBLIC_VOTES_TABLE}`]?.nodes;
    const parsedVotes = votes.map((vote: XDRVote) => {
      return parseVoteFromXDR(vote);
    });

    return parsedVotes;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function runGraphQLQuery(queryString: string, operationName: string) {
  try {
    const res = await fetch(apiEndpoint, {
      cache: "no-cache",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName,
        query: queryString,
      }),
    });
    const json_res = await res.json();
    const data = json_res.data;
    return data;
  } catch (e) {
    console.log("error on fetch");
    console.error(e);
    return null;
  }
}
