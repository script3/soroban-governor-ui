import { VoteSupport } from "@/types";
import {
  GovernorContract,
  GovernorSettings,
  TokenVotesContract,
  VoteCount,
  VotesContract,
} from "@script3/soroban-governor-sdk";
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
      "",
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
  const result = (
    await invokeOperation<GovernorSettings>(
      "",
      FALSE_SIGN,
      network,
      txOptions,
      GovernorContract.parsers.settings,
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
      "",
      FALSE_SIGN,
      network,
      txOptions,
      GovernorContract.parsers.getProposalVotes,
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
      "",
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
      "",
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
        "",
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
      "",
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
