import {
  Governor,
  Proposal,
  ProposalStatusExt,
  Vote,
  VoteSupport,
} from "@/types";
import {
  getBalance,
  getClaimAmount,
  getDelegate,
  getEmissionConfig,
  getGovernorCouncil,
  getGovernorSettings,
  getNextPropId,
  getPastVotingPower,
  getProposal,
  getUserVoteForProposal,
  getVotingPower,
} from "@/utils/contractReader";
import {
  fetchProposalById,
  fetchProposalsByGovernor,
  fetchVotesByProposal,
} from "@/utils/graphql";
import { LedgerEntry } from "@/utils/stellar";
import {
  EmissionConfig,
  GovernorSettings,
} from "@script3/soroban-governor-sdk";
import { Address, rpc } from "@stellar/stellar-sdk";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import governors from "../../public/governors/governors.json";
import { useWallet } from "./wallet";
const DEFAULT_STALE_TIME = 20 * 1000;
const ONE_DAY_LEDGERS = 17280;
const MAX_PROPOSAL_LIFETIME = 31 * ONE_DAY_LEDGERS;

export function useCurrentBlockNumber(): UseQueryResult<number, Error> {
  const { network } = useWallet();
  return useQuery({
    staleTime: 5 * 1000,
    queryKey: ["blockNumber"],
    queryFn: async () => {
      const stellarRpc = new rpc.Server(network.rpc);
      const data = await stellarRpc.getLatestLedger();
      return data.sequence;
    },
  });
}

export function useWalletBalance(
  tokenAddress: string | undefined
): UseQueryResult<LedgerEntry<bigint>> {
  const { network, walletAddress, connected } = useWallet();
  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: connected && tokenAddress !== undefined,
    placeholderData: { entry: BigInt(0) },
    queryKey: ["balance", tokenAddress, walletAddress],
    queryFn: async (): Promise<LedgerEntry<bigint>> => {
      if (tokenAddress === undefined || !connected || walletAddress === "") {
        return { entry: BigInt(0) };
      }
      return await getBalance(network, tokenAddress, walletAddress);
    },
  });
}

//********* Governor **********//

export function useGovernors(): Governor[] {
  return governors as Governor[];
}

export function useGovernor(governorId: string): Governor | undefined {
  return governors.find((governor) => governor.address === governorId);
}

export function useGovernorSettings(
  governorId: string | undefined,
  enabled: boolean = true
): UseQueryResult<GovernorSettings> {
  const { network } = useWallet();

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["governor", governorId],
    enabled: governorId !== undefined && enabled,
    queryFn: async () => {
      if (governorId) {
        let settings_entry = await getGovernorSettings(network, governorId);
        return settings_entry?.entry;
      }
    },
  });
}

export function useGovernorCouncil(
  governorId: string | undefined,
  enabled: boolean = true
): UseQueryResult<Address> {
  const { network } = useWallet();

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["governor_council", governorId],
    enabled: governorId !== undefined && enabled,
    queryFn: async () => {
      if (governorId) {
        let council_entry = await getGovernorCouncil(network, governorId);
        return council_entry?.entry;
      }
    },
  });
}

//********* Proposals **********//

export function useProposals(
  governorAddress: string | undefined,
  currentBlock: number | undefined,
  enabled: boolean = true
): UseQueryResult<Proposal[]> {
  const { network } = useWallet();
  const paramsDefined =
    governorAddress !== undefined && currentBlock !== undefined;

  async function loadProposals(): Promise<Proposal[]> {
    if (paramsDefined) {
      let proposals = (await fetchProposalsByGovernor(governorAddress)).sort(
        ({ id: a }, { id: b }) => b - a
      );
      let lastProposalId =
        ((await getNextPropId(network, governorAddress)) ?? 0) - 1;
      let currPropIndex = 0;

      for (let propId = lastProposalId; propId >= 0; propId--) {
        let indexerProp = proposals[currPropIndex];
        if (indexerProp !== undefined && indexerProp.id === propId) {
          // check if proposal needs to be updated from chain
          if (
            indexerProp.status === ProposalStatusExt.Open ||
            (indexerProp.status === ProposalStatusExt.Successful &&
              indexerProp.action.tag !== "Snapshot")
          ) {
            let fromRPC = await getProposal(
              network,
              governorAddress,
              propId,
              currentBlock
            );
            if (fromRPC?.entry) {
              proposals[currPropIndex] = fromRPC.entry;
            } else {
              break;
            }
          } else if (
            indexerProp.vote_start + MAX_PROPOSAL_LIFETIME <
            currentBlock
          ) {
            break;
          }
          currPropIndex++;
        } else {
          // propId does not exist. Insert it.
          let fromRPC = await getProposal(
            network,
            governorAddress,
            propId,
            currentBlock
          );
          if (fromRPC?.entry) {
            proposals.splice(currPropIndex, 0, fromRPC.entry);
            currPropIndex++;
          } else {
            break;
          }
        }
      }
      return proposals;
    } else {
      return [];
    }
  }

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && enabled,
    placeholderData: [],
    queryKey: ["proposals", governorAddress],
    queryFn: async () => {
      try {
        return await loadProposals();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  });
}

export function useProposal(
  governorAddress: string | undefined,
  proposalId: number | undefined,
  currentBlock: number | undefined,
  enabled: boolean = true
): UseQueryResult<Proposal> {
  const { network } = useWallet();
  const paramsDefined =
    governorAddress !== undefined &&
    proposalId !== undefined &&
    currentBlock !== undefined;

  async function loadProposal(): Promise<Proposal | null> {
    if (!paramsDefined) {
      return null;
    }
    let proposal = await fetchProposalById(governorAddress, proposalId);

    if (!proposal) {
      let fromRPC = await getProposal(
        network,
        governorAddress,
        proposalId,
        currentBlock
      );
      if (fromRPC?.entry) {
        return fromRPC.entry;
      } else {
        return null;
      }
    }
    let isActive =
      proposal.status === ProposalStatusExt.Open ||
      (proposal.status === ProposalStatusExt.Successful &&
        proposal.action.tag !== "Snapshot");

    if (isActive) {
      let fromRPC = await getProposal(
        network,
        governorAddress,
        proposal.id,
        currentBlock
      );
      if (fromRPC?.entry) {
        proposal = fromRPC?.entry;
      } else {
        return null;
      }
    }
    return proposal;
  }

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && enabled,
    queryKey: ["proposal", governorAddress, proposalId],
    queryFn: loadProposal,
  });
}

//********* Votes **********//

export function useVotes(
  governorAddress: string | undefined,
  proposalId: number | undefined,
  enabled: boolean = true
): UseQueryResult<Vote[]> {
  const paramsDefined =
    governorAddress !== undefined && proposalId !== undefined;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && enabled,
    placeholderData: [],
    queryKey: ["votes", governorAddress, proposalId],
    queryFn: () => {
      if (paramsDefined) {
        return fetchVotesByProposal(governorAddress, proposalId);
      } else {
        return [];
      }
    },
  });
}

export function useVotingPower(
  voteTokenAddress: string | undefined,
  enabled: boolean = true
): UseQueryResult<LedgerEntry<bigint>> {
  const { network, walletAddress, connected } = useWallet();
  const paramsDefined = voteTokenAddress !== undefined;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && connected && enabled,
    placeholderData: { entry: BigInt(0) },
    queryKey: ["votingPower", voteTokenAddress, walletAddress],
    queryFn: async (): Promise<LedgerEntry<bigint>> => {
      if (!paramsDefined || !connected || walletAddress === "") {
        return { entry: BigInt(0) };
      }
      return await getVotingPower(network, voteTokenAddress, walletAddress);
    },
  });
}

export function useVotingPowerByLedger(
  voteTokenAddress: string | undefined,
  ledger: number | undefined,
  currentLedger: number | undefined,
  enabled: boolean = true
): UseQueryResult<LedgerEntry<bigint>> {
  const { network, walletAddress, connected } = useWallet();
  const paramsDefined =
    voteTokenAddress !== undefined &&
    ledger !== undefined &&
    currentLedger !== undefined;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && connected && enabled,
    placeholderData: { entry: BigInt(0) },
    queryKey: ["votingPowerByProposal", ledger, connected],
    queryFn: async (): Promise<LedgerEntry<bigint>> => {
      if (!paramsDefined || !connected || walletAddress === "") {
        return { entry: BigInt(0) };
      }
      return await getPastVotingPower(
        network,
        voteTokenAddress,
        walletAddress,
        ledger,
        currentLedger
      );
    },
  });
}

export function useUserVoteByProposalId(
  governorAddress: string | undefined,
  proposalId: number | undefined,
  enabled: boolean = true
): UseQueryResult<VoteSupport | undefined> {
  const { network, walletAddress, connected } = useWallet();
  const paramsDefined =
    governorAddress !== undefined && proposalId !== undefined;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && connected && enabled,
    placeholderData: undefined,
    queryKey: ["userVoteByProposalId", proposalId, walletAddress],
    queryFn: async (): Promise<VoteSupport | undefined> => {
      if (!paramsDefined || !connected || walletAddress === "") {
        return undefined;
      }
      let entry = await getUserVoteForProposal(
        network,
        governorAddress,
        proposalId,
        walletAddress
      );
      return entry.entry;
    },
  });
}

export function useEmissionConfig(
  voteTokenAddress: string | undefined,
  enabled: boolean = true
) {
  const { network } = useWallet();
  const paramsDefined = voteTokenAddress !== undefined;

  const placeholder: EmissionConfig = {
    eps: BigInt(0),
    expiration: BigInt(0),
  };
  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && enabled,
    placeholderData: placeholder,
    queryKey: ["emisConfig", voteTokenAddress],
    queryFn: async () => {
      if (!paramsDefined) {
        return placeholder;
      }
      return await getEmissionConfig(network, voteTokenAddress);
    },
  });
}

export function useClaimAmount(
  voteTokenAddress: string | undefined,
  enabled: boolean = true
): UseQueryResult<LedgerEntry<bigint>> {
  const { network, connected, walletAddress } = useWallet();
  const paramsDefined = voteTokenAddress !== undefined;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && connected && enabled,
    placeholderData: BigInt(0),
    queryKey: ["claimAmount", voteTokenAddress, walletAddress],
    queryFn: async () => {
      if (!paramsDefined || walletAddress === "") {
        return BigInt(0);
      }
      return await getClaimAmount(network, voteTokenAddress, walletAddress);
    },
  });
}

export function useDelegate(
  voteTokenAddress: string | undefined,
  enabled: boolean = true
): UseQueryResult<LedgerEntry<string>> {
  const { network, walletAddress, connected } = useWallet();
  const paramsDefined = voteTokenAddress !== undefined;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    enabled: paramsDefined && connected && enabled,
    placeholderData: walletAddress,
    queryKey: ["delegate", voteTokenAddress, walletAddress],
    queryFn: async () => {
      if (!paramsDefined || !connected || walletAddress === "") {
        return walletAddress;
      }
      return await getDelegate(network, voteTokenAddress, walletAddress);
    },
  });
}
