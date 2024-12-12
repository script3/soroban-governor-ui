import {
  Proposal as FlattenedProposal,
  ProposalStatusExt,
  VoteSupport,
  oldSettingsSpec,
} from "@/types";
import {
  BondingVotesContract,
  EmissionConfig,
  GovernorContract,
  GovernorSettings,
  TokenVotesContract,
  VoteCount,
  VotesContract,
} from "@script3/soroban-governor-sdk";
import { Address, rpc, scValToNative, xdr } from "@stellar/stellar-sdk";
import { LedgerEntry, Network, simulateOperation } from "./stellar";

const ONLY_V0_GOV = "CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV";

//********** Common **********//

/**
 * Fetch the balance of a user from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param userId - The user ID to fetch the balance of
 * @returns LedgerEntry<BigInt> of the user's balance
 * @throws Error if the operation fails
 */
export async function getBalance(
  network: Network,
  contractId: string,
  userId: string
): Promise<LedgerEntry<bigint>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new TokenVotesContract(contractId);
  const operation = contract.balance({ id: userId });
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return {
      entry: TokenVotesContract.parsers.balance(
        sim_result.result!.retval.toXDR("base64")
      ),
    };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getBalance. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return { entry: BigInt(0), restoreResponse: sim_result };
  } else {
    throw new Error("Failed balance simulation " + sim_result.error);
  }
}

//********** Governor **********//

/**
 * Fetch the governor settings from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @returns GovernorSettings for the governor contract
 * @throws Error if the operation fails
 */
export async function getGovernorSettings(
  network: Network,
  contractId: string
): Promise<LedgerEntry<GovernorSettings>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new GovernorContract(contractId);
  const operation = contract.settings();
  const sim_result = await simulateOperation(stellarRpc, operation);

  let safe_parser =
    contractId === ONLY_V0_GOV
      ? (result: string): GovernorSettings =>
          oldSettingsSpec.funcResToNative("settings", result)
      : GovernorContract.parsers.settings;

  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return { entry: safe_parser(sim_result.result!.retval.toXDR("base64")) };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for settings. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return { entry: {} as GovernorSettings, restoreResponse: sim_result };
  } else {
    throw new Error("Failed settings simulation " + sim_result.error);
  }
}

/**
 * Fetch the governor council from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @returns Security Council for the governor contract
 * @throws Error if the operation fails
 */
export async function getGovernorCouncil(
  network: Network,
  contractId: string
): Promise<LedgerEntry<Address>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new GovernorContract(contractId);
  const operation = contract.council();
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return {
      entry: GovernorContract.parsers.council(
        sim_result.result!.retval.toXDR("base64")
      ),
    };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for settings. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return { entry: {} as Address, restoreResponse: sim_result };
  } else {
    throw new Error("Failed balance simulation " + sim_result.error);
  }
}

/**
 * Fetch the votes for a proposal from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param proposalId - The proposal ID to fetch the votes of
 * @returns VoteCount for the proposal
 * @throws Error if the operation fails
 */
export async function getProposalVotes(
  network: Network,
  contractId: string,
  proposalId: number
): Promise<LedgerEntry<VoteCount>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new GovernorContract(contractId);
  const operation = contract.getProposalVotes({ proposal_id: proposalId });
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    if (sim_result.result!.retval.toXDR("base64") === "AAAAAQ==") {
      return {
        entry: { _for: BigInt(0), against: BigInt(0), abstain: BigInt(0) },
      };
    } else {
      let votes = scValToNative(sim_result.result!.retval);
      return { entry: votes as VoteCount };
    }
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getProposalVotes. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return {
      entry: { _for: BigInt(0), against: BigInt(0), abstain: BigInt(0) },
      restoreResponse: sim_result,
    };
  } else {
    throw new Error("Failed getProposalVotes simulation " + sim_result.error);
  }
}

/**
 * Fetch the vote of a user for a proposal from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param proposalId - The proposal ID to fetch the vote of
 * @param userId - The user ID to fetch the vote of
 * @returns VoteSupport for the user's vote or undefined if the user has not voted
 * @throws Error if the operation fails
 */
export async function getUserVoteForProposal(
  network: Network,
  contractId: string,
  proposalId: number,
  userId: string
): Promise<LedgerEntry<VoteSupport | undefined>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new GovernorContract(contractId);
  const operation = contract.getVote({
    proposal_id: proposalId,
    voter: userId,
  });
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return {
      entry: GovernorContract.parsers.getVote(
        sim_result.result!.retval.toXDR("base64")
      ),
    };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getUserVoteForProposal. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return {
      entry: undefined,
      restoreResponse: sim_result,
    };
  } else {
    throw new Error(
      "Failed getUserVoteForProposal simulation " + sim_result.error
    );
  }
}

export async function getProposal(
  network: Network,
  contractId: string,
  proposalId: number,
  currentBlock: number
): Promise<LedgerEntry<FlattenedProposal | undefined>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new GovernorContract(contractId);
  const operation = contract.getProposal({
    proposal_id: proposalId,
  });
  const [sim_result, voteCount] = await Promise.all([
    await simulateOperation(stellarRpc, operation),
    getProposalVotes(network, contractId, proposalId),
  ]);

  if (rpc.Api.isSimulationSuccess(sim_result)) {
    if (sim_result.result!.retval.toXDR("base64") === "AAAAAQ==") {
      return { entry: undefined };
    } else {
      let proposal = scValToNative(sim_result.result!.retval);
      proposal.config.action = {
        tag: proposal.config.action[0],
        values: proposal.config.action[1],
      };
      let flattenedProposal: FlattenedProposal = {
        id: proposal.id,
        status: proposal.data.status as number as ProposalStatusExt,
        title: proposal.config.title,
        description: proposal.config.description,
        action: proposal.config.action,
        proposer: proposal.data.creator,
        vote_start: proposal.data.vote_start,
        vote_end: proposal.data.vote_end,
        eta: proposal.data.eta,
        vote_count: voteCount.entry,
      };
      if (
        flattenedProposal.vote_start < currentBlock &&
        flattenedProposal.vote_end > currentBlock
      ) {
        flattenedProposal.status = ProposalStatusExt.Active;
      } else if (flattenedProposal.vote_start > currentBlock) {
        flattenedProposal.status = ProposalStatusExt.Pending;
      }
      return { entry: flattenedProposal };
    }
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getProposal. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return {
      entry: undefined,
      restoreResponse: sim_result,
    };
  } else {
    throw new Error("Failed getProposal simulation " + sim_result.error);
  }
}

export async function getNextPropId(
  network: Network,
  contractId: string
): Promise<number | undefined> {
  try {
    const stellarRpc = new rpc.Server(network.rpc, network.opts);
    let ledgerKey = contractId === ONLY_V0_GOV ? "ProposalId" : "PropId";
    let contract_entry = await stellarRpc.getContractData(
      contractId,
      xdr.ScVal.scvSymbol(ledgerKey),
      rpc.Durability.Persistent
    );
    if (contract_entry.val) {
      let data = contract_entry.val.contractData().val();
      let propId = scValToNative(data) as number;
      return propId;
    }
    return undefined;
  } catch (e) {
    console.error("Unable to load next proposal id", e);
    return undefined;
  }
}

//********** Votes **********//

/**
 * Fetch the voting power of a user from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param userId - The user ID to fetch the voting power of
 * @returns BigInt of the user's voting power
 * @throws Error if the operation fails
 */
export async function getVotingPower(
  network: Network,
  contractId: string,
  userId: string
): Promise<LedgerEntry<bigint>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new VotesContract(contractId);
  const operation = contract.getVotes({ account: userId });
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return {
      entry: VotesContract.votes_parsers.getVotes(
        sim_result.result!.retval.toXDR("base64")
      ),
    };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getVotingPower. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return {
      entry: BigInt(0),
      restoreResponse: sim_result,
    };
  } else {
    throw new Error("Failed getVotingPower simulation " + sim_result.error);
  }
}

/**
 * Fetch the voting power of a user at a given ledger. If the ledger is in the future,
 * the current voting power is returned.
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param userId - The user ID to fetch the voting power of
 * @param voteStart - The ledger timestamp where votes will be fetched from and when voting can begin
 * @param currentLedger - The current ledger timestamp
 * @returns BigInt of the user's voting power
 * @throws Error if the operation fails
 */
export async function getPastVotingPower(
  network: Network,
  contractId: string,
  userId: string,
  voteStart: number,
  currentLedger: number
): Promise<LedgerEntry<bigint>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new VotesContract(contractId);
  if (voteStart < currentLedger) {
    const operation = contract.getPastVotes({
      user: userId,
      sequence: voteStart,
    });
    const sim_result = await simulateOperation(stellarRpc, operation);
    if (rpc.Api.isSimulationSuccess(sim_result)) {
      return {
        entry: VotesContract.votes_parsers.getVotes(
          sim_result.result!.retval.toXDR("base64")
        ),
      };
    } else if (rpc.Api.isSimulationRestore(sim_result)) {
      console.log(
        "Restore required for getPastVotingPower. Footprint: " +
          sim_result.restorePreamble.transactionData
            ?.getFootprint()
            ?.toXDR("base64")
      );
      return {
        entry: BigInt(0),
        restoreResponse: sim_result,
      };
    } else {
      throw new Error(
        "Failed getPastVotingPower simulation " + sim_result.error
      );
    }
  } else {
    return getVotingPower(network, contractId, userId);
  }
}

/**
 * Fetch the emission config for a bonding votes contract
 * @param network - The network to use
 * @param contractId - The contract ID to check
 * @returns The emissions config, or an empty emissions config if an error occurs
 */
export async function getEmissionConfig(
  network: Network,
  contractId: string
): Promise<EmissionConfig> {
  try {
    let stellarRpc = new rpc.Server(network.rpc, network.opts);
    let contract_entry = await stellarRpc.getContractData(
      contractId,
      xdr.ScVal.scvSymbol("EMIS_CFG"),
      rpc.Durability.Persistent
    );
    if (contract_entry.val) {
      let data = contract_entry.val.contractData().val();
      let emis_data = scValToNative(data) as EmissionConfig;
      return emis_data;
    }
  } catch (e) {}
  return {
    eps: BigInt(0),
    expiration: BigInt(0),
  };
}

/**
 * Fetch the claim amount for a user from a bonding votes contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param userId - The user ID
 * @returns BigInt of the user's claim amount
 * @throws Error if the operation fails
 */
export async function getClaimAmount(
  network: Network,
  contractId: string,
  userId: string
): Promise<LedgerEntry<bigint>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new BondingVotesContract(contractId);
  const operation = contract.claim({
    address: userId,
  });
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return {
      entry: BondingVotesContract.parsers.claim(
        sim_result.result!.retval.toXDR("base64")
      ),
    };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getClaim. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return {
      entry: BigInt(0),
      restoreResponse: sim_result,
    };
  } else {
    throw new Error("Failed getClaim simulation " + sim_result.error);
  }
}

/**
 * Fetch the delegate of a user from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param userId - The user ID to fetch the delegate of
 * @returns string of the user's delegate
 * @throws Error if the operation fails
 */
export async function getDelegate(
  network: Network,
  contractId: string,
  userId: string
): Promise<LedgerEntry<string>> {
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const contract = new VotesContract(contractId);
  const operation = contract.getDelegate({ account: userId });
  const sim_result = await simulateOperation(stellarRpc, operation);
  if (rpc.Api.isSimulationSuccess(sim_result)) {
    return {
      entry: VotesContract.votes_parsers.getDelegate(
        sim_result.result!.retval.toXDR("base64")
      ),
    };
  } else if (rpc.Api.isSimulationRestore(sim_result)) {
    console.log(
      "Restore required for getDelegate. Footprint: " +
        sim_result.restorePreamble.transactionData
          ?.getFootprint()
          ?.toXDR("base64")
    );
    return {
      entry: "",
      restoreResponse: sim_result,
    };
  } else {
    throw new Error("Failed getDelegate simulation " + sim_result.error);
  }
}
