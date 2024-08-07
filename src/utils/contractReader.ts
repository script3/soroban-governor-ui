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
  Option,
  Proposal,
  TokenVotesContract,
  VoteCount,
  VotesContract,
} from "@script3/soroban-governor-sdk";
import { Address, SorobanRpc, scValToNative, xdr } from "@stellar/stellar-sdk";
import { Network, TxOptions, invokeOperation } from "./stellar";

function getSimTxParams(network: Network): TxOptions {
  return {
    sim: true,
    pollingInterval: 1000,
    timeout: 5000,
    builderOptions: {
      fee: "10000",
      timebounds: {
        minTime: 0,
        maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
      },
      networkPassphrase: network.passphrase,
    },
  };
}

const FALSE_SIGN = (txXdr: string): any => txXdr;

// zero address - won't get fetched. Just needs to be a valid keypair
const PUBKEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

const ONLY_V0_GOV = "CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV";

//********** Common **********//

/**
 * Fetch the balance of a user from a contract
 * @param network - The network to use
 * @param contractId - The contract ID to call
 * @param userId - The user ID to fetch the balance of
 * @returns BigInt of the user's balance
 * @throws Error if the operation fails
 */
export async function getBalance(
  network: Network,
  contractId: string,
  userId: string
): Promise<bigint> {
  const txOptions = getSimTxParams(network);
  const contract = new TokenVotesContract(contractId);
  const operation = contract.balance({ id: userId });
  const result = (
    await invokeOperation<bigint>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      TokenVotesContract.parsers.balance,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
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
): Promise<GovernorSettings> {
  const txOptions = getSimTxParams(network);
  const contract = new GovernorContract(contractId);
  const operation = contract.settings();
  let safe_parser =
    contractId === ONLY_V0_GOV
      ? (result: string): GovernorSettings =>
          oldSettingsSpec.funcResToNative("settings", result)
      : GovernorContract.parsers.settings;
  const result = (
    await invokeOperation<GovernorSettings>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      safe_parser,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
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
): Promise<Address> {
  const txOptions = getSimTxParams(network);
  const contract = new GovernorContract(contractId);
  const operation = contract.council();
  const result = (
    await invokeOperation<Address>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      GovernorContract.parsers.council,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
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
): Promise<VoteCount> {
  const txOptions = getSimTxParams(network);
  const contract = new GovernorContract(contractId);
  const operation = contract.getProposalVotes({ proposal_id: proposalId });
  const result = (
    await invokeOperation<VoteCount | undefined>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      (result: string): VoteCount => {
        let temp = scValToNative(xdr.ScVal.fromXDR(result, "base64"));
        return temp as VoteCount;
      },
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  let votes = result.unwrap();
  return votes ?? { _for: BigInt(0), against: BigInt(0), abstain: BigInt(0) };
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
): Promise<VoteSupport | undefined> {
  const txOptions = getSimTxParams(network);
  const contract = new GovernorContract(contractId);
  const operation = contract.getVote({
    proposal_id: proposalId,
    voter: userId,
  });
  const result = (
    await invokeOperation<number | undefined>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      GovernorContract.parsers.getVote,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap() as VoteSupport;
}

export async function getProposal(
  network: Network,
  contractId: string,
  proposalId: number,
  currentBlock: number
): Promise<FlattenedProposal | undefined> {
  try {
    const txOptions = getSimTxParams(network);
    const contract = new GovernorContract(contractId);
    const operation = contract.getProposal({
      proposal_id: proposalId,
    });
    const [result, voteCount] = await Promise.all([
      invokeOperation<Option<Proposal>>(
        PUBKEY,
        FALSE_SIGN,
        network,
        txOptions,
        (result: string) => {
          // TODO: Contract Spec parsing with option is broken, and scValToNative
          //       builds a slightly different object for the "ProposalAction" type.
          if (result === "AAAAAQ==") {
            return undefined;
          } else {
            let proposal = scValToNative(xdr.ScVal.fromXDR(result, "base64"));
            proposal.config.action = {
              tag: proposal.config.action[0],
              values: proposal.config.action[1],
            };
            return proposal as Proposal;
          }
        },
        operation
      ),
      getProposalVotes(network, contractId, proposalId),
    ]);

    if (result.result.isErr()) {
      throw result.result.unwrapErr();
    }

    let proposal = result.result.unwrap();
    if (proposal) {
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
        vote_count: voteCount,
      };
      if (
        flattenedProposal.vote_start < currentBlock &&
        flattenedProposal.vote_end > currentBlock
      ) {
        flattenedProposal.status = ProposalStatusExt.Active;
      } else if (flattenedProposal.vote_start > currentBlock) {
        flattenedProposal.status = ProposalStatusExt.Pending;
      }

      return flattenedProposal;
    }
  } catch (e) {
    console.error("Unable to load proposal", proposalId, e);
    return undefined;
  }
}

export async function getNextPropId(
  network: Network,
  contractId: string
): Promise<number | undefined> {
  try {
    let rpc = new SorobanRpc.Server(network.rpc, network.opts);
    let ledgerKey = contractId === ONLY_V0_GOV ? "ProposalId" : "PropId";
    let contract_entry = await rpc.getContractData(
      contractId,
      xdr.ScVal.scvSymbol(ledgerKey),
      SorobanRpc.Durability.Persistent
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
): Promise<bigint> {
  const txOptions = getSimTxParams(network);
  const contract = new VotesContract(contractId);
  const operation = contract.getVotes({ account: userId });
  const result = (
    await invokeOperation<bigint>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      VotesContract.votes_parsers.getVotes,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
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
): Promise<bigint> {
  const txOptions = getSimTxParams(network);
  const contract = new VotesContract(contractId);
  if (voteStart < currentLedger) {
    const operation = contract.getPastVotes({
      user: userId,
      sequence: voteStart,
    });
    const result = (
      await invokeOperation<bigint>(
        PUBKEY,
        FALSE_SIGN,
        network,
        txOptions,
        VotesContract.votes_parsers.getPastVotes,
        operation
      )
    ).result;
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return result.unwrap();
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
    let rpc = new SorobanRpc.Server(network.rpc, network.opts);
    let contract_entry = await rpc.getContractData(
      contractId,
      xdr.ScVal.scvSymbol("EMIS_CFG"),
      SorobanRpc.Durability.Persistent
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
): Promise<bigint> {
  const txOptions = getSimTxParams(network);
  const contract = new BondingVotesContract(contractId);
  const operation = contract.claim({
    address: userId,
  });
  const result = (
    await invokeOperation<bigint>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      BondingVotesContract.parsers.claim,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
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
): Promise<string> {
  const txOptions = getSimTxParams(network);
  const contract = new VotesContract(contractId);
  const operation = contract.getDelegate({ account: userId });
  const result = (
    await invokeOperation<string>(
      PUBKEY,
      FALSE_SIGN,
      network,
      txOptions,
      VotesContract.votes_parsers.getDelegate,
      operation
    )
  ).result;
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
}
