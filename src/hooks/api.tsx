import { mockDAOS, mockProposals, mockVotes } from "@/mock/dao";
import { Governor, Proposal, Vote } from "@/types";

import { DefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
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
    return mockDAOS;
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
    console.log({ governorId });
    const foundGovernor = mockDAOS.find((p) => p.name === governorId);
    return foundGovernor;
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
