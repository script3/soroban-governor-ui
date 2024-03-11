import { mockProposals, mockVotes } from "@/mock/dao";
import { Governor, Proposal, Vote } from "@/types";
import { DefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useWallet } from "./wallet";
import governors from "../../public/governors/governors.json";
const mappedGovernors = governors.map(
  ({ timelock, votePeriod, proposalThreshold, voteDelay, ...rest }) => {
    return {
      ...rest,
      timelock: BigInt(timelock),
      votePeriod: BigInt(votePeriod),
      proposalThreshold: BigInt(proposalThreshold),
      voteDelay: BigInt(voteDelay),
    };
  }
);
const DEFAULT_STALE_TIME = 20 * 1000;
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
  async function getGovernorById(governorId: string) {
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
  daoId: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["proposals", daoId],
    queryFn: () => loadProposalsByDaoId(daoId),
  });
  async function loadProposalsByDaoId(daoId: string): Promise<Proposal[]> {
    // return mockProposals.filter((p) => p.contract_id === daoId);
    return mockProposals;
  }
  return {
    proposals: data as Proposal[],
    isLoading,
    error,
  };
}

export function useProposal(
  proposalId: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["proposal", proposalId],
    queryFn: () => getProposalById(proposalId),
  });
  async function getProposalById(proposalId: number) {
    return mockProposals.find((p) => p.id === proposalId);
  }

  return {
    proposal: proposal as Proposal,
    isLoading,
    error,
  };
}

export function useVotes(
  proposalId: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const {
    data: votes,
    isLoading,
    error,
  } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["votes", proposalId],
    queryFn: () => getVotesByProposalId(proposalId),
  });
  async function getVotesByProposalId(proposalId: number) {
    return mockVotes.filter((p) => p.proposal_id === proposalId);
  }

  return {
    votes: votes as Vote[],
    isLoading,
    error,
  };
}

export function useVoteTokenBalance(
  voteTokenAddress: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getVoteTokenBalance, connected } = useWallet();
  const { data, isLoading, error } = useQuery({
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
  };
}

export function useVotingPowerByProposal(
  voteTokenAddress: string,
  proposalStartTime: number,
  proposalId: number,
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
      console.log({ result });
      return result || null;
    },
  });
  return {
    userVote: data as bigint,
    isLoading,
    error,
  };
}
