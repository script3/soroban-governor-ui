import { DUMMY_ADDRESS } from "@/constants";
import {
  TxOptions,
  invokeOperation,
  parseResultFromXDRString,
} from "@/utils/operation";
import {
  FreighterModule,
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit/build/main";

import React, { useContext, useEffect, useState } from "react";
import {
  ContractError,
  ContractResult,
  ProposalAction,
  VoteCount,
  GovernorContract,
  TokenVotesContract,
  BondingVotesContract,
  GovernorErrors,
  VotesErrors,
} from "@script3/soroban-governor-sdk";
import { Address, SorobanRpc, xdr } from "@stellar/stellar-sdk";
import { getTokenBalance as getBalance } from "@/utils/token";
import { useLocalStorageState } from "./useLocalStorageState";
export class Resources {
  fee: number;
  refundableFee: number;
  cpuInst: number;
  readBytes: number;
  writeBytes: number;
  readOnlyEntries: number;
  readWriteEntries: number;
  constructor(
    fee: number,
    refundableFee: number,
    cpuInst: number,
    readBytes: number,
    writeBytes: number,
    readOnlyEntries: number,
    readWriteEntries: number
  ) {
    this.fee = fee;
    this.refundableFee = refundableFee;
    this.cpuInst = cpuInst;
    this.readBytes = readBytes;
    this.writeBytes = writeBytes;
    this.readOnlyEntries = readOnlyEntries;
    this.readWriteEntries = readWriteEntries;
  }
}
export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  txStatus: TxStatus;
  lastTxHash: string | undefined;
  lastTxMessage: string | undefined;
  notificationMode: string;
  showNotification: boolean;
  notificationTitle: string;
  isLoading: boolean;
  network: Network;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearLastTx: () => void;
  submitTransaction: <T>(submission: Promise<any>) => Promise<T | undefined>;
  rpcServer: () => SorobanRpc.Server;
  vote: (
    proposalId: number,
    support: number,
    sim: boolean,
    governorAddress: string
  ) => Promise<bigint | undefined>;
  createProposal: (
    title: string,
    description: string,
    action: ProposalAction,
    sim: boolean,
    governorAddress: string
  ) => Promise<bigint | undefined>;
  executeProposal: (
    proposalId: number,
    governorAddress: string,
    sim?: boolean
  ) => Promise<bigint | undefined>;
  closeProposal: (
    proposalId: number,
    governorAddress: string,
    sim?: boolean
  ) => Promise<bigint | undefined>;
  cancelProposal: (
    proposalId: number,
    governorAddress: string,
    sim?: boolean
  ) => Promise<bigint | undefined>;
  getVoteTokenBalance: (
    voteTokenAddress: string,
    sim: boolean
  ) => Promise<bigint>;
  getTokenBalance: (tokenAddress: string) => Promise<bigint>;
  getVotingPowerByProposal: (
    voteTokenAddress: string,
    proposalStart: number,
    currentBlockNumber: number,
    sim: boolean
  ) => Promise<bigint>;
  getTotalVotesByProposal: (
    proposalId: number,
    governorAddress: string,
    sim?: boolean
  ) => Promise<VoteCount | ContractError | undefined>;
  wrapToken: (
    voteTokenAddress: string,
    amount: bigint,
    sim: boolean
  ) => Promise<bigint>;
  unwrapToken: (
    voteTokenAddress: string,
    amount: bigint,
    sim: boolean
  ) => Promise<bigint>;
  getUserVoteByProposalId: (
    proposalId: number,
    governorAddress: string,
    sim: boolean
  ) => Promise<number | undefined>;
  getDelegate: (
    voteTokenAddress: string,
    sim: boolean
  ) => Promise<string | undefined>;
  delegate: (
    voteTokenAddress: string,
    addressToDelegate: string,
    sim: boolean
  ) => Promise<bigint | undefined>;
  setNetwork: (
    newUrl: string,
    newPassphrase: string,
    newOpts: Network["opts"]
  ) => void;
  closeNotification: () => void;
}

export enum TxStatus {
  NONE,
  BUILDING,
  SIGNING,
  SUBMITTING,
  SUCCESS,
  FAIL,
}

interface Network {
  rpc: string;
  passphrase: string;
  opts?: SorobanRpc.Server.Options;
}

const WalletContext = React.createContext<IWalletContext | undefined>(
  undefined
);

export const WalletProvider = ({ children = null as any }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [autoConnect, setAutoConnect] = useLocalStorageState(
    "autoConnect",
    "false"
  );
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);
  const [notificationMode, setNotificationMode] = useState<string>("");
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationTitle, setNotificationTitle] = useState<string>("");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txMessage, setTxMessage] = useState<string | undefined>(undefined);
  const [network, setStateNetwork] = useState<Network>({
    rpc:
      process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
    opts: undefined,
  });

  // wallet state
  const [walletAddress, setWalletAddress] = useState<string>("");

  const walletKit: StellarWalletsKit = new StellarWalletsKit({
    network: network.passphrase as WalletNetwork,
    selectedWalletId:
      autoConnect !== undefined && autoConnect !== "false"
        ? autoConnect
        : XBULL_ID,
    modules: [new xBullModule(), new FreighterModule()],
  });

  useEffect(() => {
    if (!connected && !!autoConnect && autoConnect !== "false") {
      // @dev: timeout ensures chrome has the ability to load extensions
      setTimeout(() => {
        handleSetWalletAddress();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  function setCleanTxMessage(message: string | undefined) {
    if (message) {
      // some contract failures include diagnostic information. If so, try and remove it.
      let substrings = message.split("Event log (newest first):");
      if (substrings.length > 1) {
        const cleanMessage = substrings[0].trim();

        setTxMessage(cleanMessage);
      } else {
        setTxMessage(message);
      }
    }
  }

  /**
   * Connect a wallet to the application via the walletKit
   */
  async function handleSetWalletAddress() {
    try {
      const publicKey = await walletKit.getPublicKey();
      setWalletAddress(publicKey);
      setConnected(true);
    } catch (e: any) {
      console.error("Unable to load wallet information: ", e);
    }
  }

  /**
   * Open up a modal to connect the user's browser wallet
   */
  async function connect() {
    try {
      await walletKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          walletKit.setWallet(option.id);
          setAutoConnect(option.id);
          await handleSetWalletAddress();
        },
      });
    } catch (e: any) {
      console.error("Unable to connect wallet: ", e);
    }
  }

  function disconnect() {
    setWalletAddress("");
    setConnected(false);
    setAutoConnect("false");
  }

  function setNetwork(
    newUrl: string,
    newPassphrase: string,
    newOpts: Network["opts"]
  ) {
    setStateNetwork({ rpc: newUrl, passphrase: newPassphrase, opts: newOpts });
  }

  function rpcServer() {
    return new SorobanRpc.Server(network.rpc, network.opts);
  }

  /**
   * Sign an XDR string with the connected user's wallet
   * @param xdr - The XDR to sign
   * @param networkPassphrase - The network passphrase
   * @returns - The signed XDR as a base64 string
   */
  async function sign(xdr: string): Promise<string> {
    if (connected) {
      setTxStatus(TxStatus.SIGNING);
      try {
        let { result } = await walletKit.signTx({
          xdr: xdr,
          publicKeys: [walletAddress],
          network: network.passphrase as WalletNetwork,
        });
        setTxStatus(TxStatus.SUBMITTING);
        return result;
      } catch (e: any) {
        setTxMessage("Transaction rejected by wallet.");
        if (typeof e === "string" && e !== "User declined access") {
          setCleanTxMessage(e);
        }
        setNotificationTitle("Transaction Failed");
        setNotificationMode("flash");
        setShowNotification(true);
        setTxStatus(TxStatus.FAIL);
        throw e;
      }
    } else {
      throw new Error("Not connected to a wallet");
    }
  }

  async function vote(
    proposalId: number,
    support: number,
    sim: boolean,
    governorAddress: string
  ) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let governorClient = new GovernorContract(governorAddress);
        let voteOperation = governorClient.vote({
          voter: walletAddress,
          proposal_id: proposalId,
          support,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          GovernorContract.parsers.vote,
          voteOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return submitTransaction<bigint>(submission, {
            notificationMode: "modal",
            notificationTitle: "Your vote is in!",
            successMessage: "Your vote has been submitted successfully",
          });
        }
      } else {
        return;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 
    creator: Address,
    calldata: Calldata,
    sub_calldata: Vec<SubCalldata>,
    title: String,
    description: String,

   */
  async function createProposal(
    title: string,
    description: string,
    action: ProposalAction,
    sim: boolean,
    governorAddress: string
  ) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let governorClient = new GovernorContract(governorAddress);

        let proposeOperation = governorClient.propose({
          creator: walletAddress,
          title,
          description,
          action,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          GovernorContract.parsers.propose,
          proposeOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          const result = await submitTransaction<bigint>(submission, {
            notificationMode: "flash",
            notificationTitle: "Proposal created",
            successMessage: "Proposal created",
            failureMessage: "Failed to create proposal",
          });
          return result || BigInt(0);
        }
      } else {
        return;
      }
    } catch (e) {
      console.log("Error creating proposal: ", e);
      throw e;
    }
  }

  async function executeProposal(
    proposalId: number,
    governorAddress: string,
    sim = false
  ) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let governorClient = new GovernorContract(governorAddress);

        let executeOperation = governorClient.execute({
          proposal_id: proposalId,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          GovernorContract.parsers.execute,
          executeOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          const result = await submitTransaction<bigint>(submission, {
            notificationMode: "flash",
            notificationTitle: "Proposal executed",
            successMessage: "Proposal executed",
            failureMessage: "Failed to execute proposal",
          });
          return result || BigInt(0);
        }
      } else {
        return;
      }
    } catch (e) {
      console.log("Error executing proposal: ", e);
      throw e;
    }
  }

  async function closeProposal(
    proposalId: number,
    governorAddress: string,
    sim = false
  ) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let governorClient = new GovernorContract(governorAddress);

        let closeOperation = governorClient.close({
          proposal_id: proposalId,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          GovernorContract.parsers.close,
          closeOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          const result = await submitTransaction<bigint>(submission, {
            notificationMode: "flash",
            notificationTitle: "Proposal closed",
            successMessage: "Proposal closed",
            failureMessage: "Failed to close proposal",
          });
          return result || BigInt(0);
        }
      } else {
        return;
      }
    } catch (e) {
      console.log("Error closing proposal: ", e);
      throw e;
    }
  }

  async function cancelProposal(
    proposalId: number,
    governorAddress: string,
    sim = false
  ) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let governorClient = new GovernorContract(governorAddress);
        let cancelOperation = governorClient.cancel({
          from: walletAddress,
          proposal_id: proposalId,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          GovernorContract.parsers.cancel,
          cancelOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          const result = await submitTransaction<bigint>(submission, {
            notificationMode: "flash",
            notificationTitle: "Proposal cancelled",
            successMessage: "Proposal cancelled",
            failureMessage: "Failed to cancel proposal",
          });
          return result || BigInt(0);
        }
      } else {
        return;
      }
    } catch (e) {
      console.log("Error cancelling proposal: ", e);
      throw e;
    }
  }

  async function getTotalVotesByProposal(
    proposalId: number,
    governorAddress: string,
    sim = true
  ) {
    try {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: "10000",
          timebounds: {
            minTime: 0,
            maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
          },
          networkPassphrase: network.passphrase,
        },
      };
      let governorClient = new GovernorContract(governorAddress);

      let proposeOperation = governorClient.getProposalVotes({
        proposal_id: proposalId,
      });
      const submission = invokeOperation<xdr.ScVal>(
        DUMMY_ADDRESS,
        sign,
        network,
        txOptions,
        parseResultFromXDRString,
        proposeOperation
      );
      const sub = await submission;
      if (sub instanceof ContractResult) {
        return sub.result.unwrap() as VoteCount;
      }
      return sub;
    } catch (e) {
      console.log("Error getting votes by proposal: ", e);
      throw e;
    }
  }

  async function getVoteTokenBalance(voteTokenAddress: string, sim: boolean) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let votesClient = new TokenVotesContract(voteTokenAddress);

        let votesOperation = votesClient.balance({
          id: walletAddress,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          TokenVotesContract.parsers.balance,
          votesOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return submitTransaction<bigint>(submission) || BigInt(0);
        }
      } else {
        return BigInt(0);
      }
    } catch (e) {
      console.log("Error getting vote token balance: ", e);
      throw e;
    }
  }

  async function getTokenBalance(tokenAddress: string) {
    try {
      if (connected) {
        const balance = await getBalance(
          rpcServer(),
          network.passphrase,
          tokenAddress,
          new Address(walletAddress)
        );
        return balance;
      } else {
        return BigInt(0);
      }
    } catch (e) {
      console.log("Error getting token balance: ", e);
      throw e;
    }
  }

  async function getVotingPowerByProposal(
    voteTokenAddress: string,
    proposalStart: number,
    currentBlockNumber: number,
    sim: boolean
  ) {
    try {
      if (connected) {
        const txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        const votesClient = new TokenVotesContract(voteTokenAddress);
        const proposalIsPast = currentBlockNumber > proposalStart;
        let proposeOperation;
        if (proposalIsPast) {
          proposeOperation = votesClient.getPastVotes({
            user: walletAddress,
            sequence: proposalStart,
          });
        } else {
          proposeOperation = votesClient.getVotes({
            account: walletAddress,
          });
        }
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          proposalIsPast
            ? TokenVotesContract.parsers.getPastVotes
            : TokenVotesContract.parsers.getVotes,
          proposeOperation
        );
        if (sim) {
          const sub = await submission;

          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return submitTransaction<bigint>(submission) || BigInt(0);
        }
      } else {
        return BigInt(0);
      }
    } catch (e) {
      console.log("Error getting voting power : ", e);
      throw e;
    }
  }

  async function wrapToken(
    voteTokenAddress: string,
    amount: bigint,
    sim: boolean
  ) {
    try {
      if (connected && walletAddress) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let votesClient = new BondingVotesContract(voteTokenAddress);
        let proposeOperation = votesClient.deposit({
          from: walletAddress,
          amount,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          BondingVotesContract.parsers.deposit,
          proposeOperation
        );
        if (sim) {
          const sub = await submission;

          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return (
            submitTransaction<bigint>(submission, {
              notificationMode: "flash",
              notificationTitle: "Tokens succesfully wrapped",
              successMessage: "Tokens succesfully wrapped",
            }) || BigInt(0)
          );
        }
      } else {
        return BigInt(0);
      }
    } catch (e) {
      console.log("Error wrapping token: ", e);
      throw e;
    }
  }

  async function unwrapToken(
    voteTokenAddress: string,
    amount: bigint,
    sim: boolean
  ) {
    try {
      if (connected && walletAddress) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let votesClient = new BondingVotesContract(voteTokenAddress);

        let withdrawOperation = votesClient.withdraw({
          from: walletAddress,
          amount,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          BondingVotesContract.parsers.withdraw,
          withdrawOperation
        );
        if (sim) {
          const sub = await submission;

          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return (
            submitTransaction<bigint>(submission, {
              notificationMode: "flash",
              notificationTitle: "Tokens succesfully unwrapped",
              failureMessage: "Tokens succesfully unwrapped",
              successMessage: "Tokens succesfully unwrapped",
            }) || BigInt(0)
          );
        }
      } else {
        return BigInt(0);
      }
    } catch (e) {
      console.log("Error unwrapping token: ", e);
      throw e;
    }
  }

  async function getUserVoteByProposalId(
    proposalId: number,
    governorAddress: string,
    sim: boolean
  ) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let governorClient = new GovernorContract(governorAddress);
        let voteOperation = governorClient.getVote({
          voter: walletAddress,
          proposal_id: proposalId,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          GovernorContract.parsers.getVote,
          voteOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return submitTransaction<bigint>(submission) || BigInt(0);
        }
      } else {
        return;
      }
    } catch (e) {
      throw e;
    }
  }

  async function getDelegate(voteTokenAddress: string, sim: boolean = true) {
    try {
      if (connected) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let voteClient = new TokenVotesContract(voteTokenAddress);
        let voteOperation = voteClient.getDelegate({
          account: walletAddress,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          TokenVotesContract.parsers.getDelegate,
          voteOperation
        );

        const sub = await submission;
        if (sub instanceof ContractResult) {
          return sub.result.unwrap();
        }
        return sub;
      } else {
        return;
      }
    } catch (e) {
      throw e;
    }
  }

  async function delegate(
    voteTokenAddress: string,
    addressToDelegate: string,
    sim: boolean
  ) {
    try {
      if (connected && walletAddress) {
        let txOptions: TxOptions = {
          sim,
          pollingInterval: 1000,
          timeout: 15000,
          builderOptions: {
            fee: "10000",
            timebounds: {
              minTime: 0,
              maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
            },
            networkPassphrase: network.passphrase,
          },
        };
        let votesClient = new TokenVotesContract(voteTokenAddress);
        let proposeOperation = votesClient.delegate({
          account: walletAddress,
          delegatee: addressToDelegate,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          TokenVotesContract.parsers.delegate,
          proposeOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          return submitTransaction<bigint>(submission, {
            notificationMode: "flash",
            notificationTitle: "Succesfully delegated",
            successMessage: "Succesfully delegated",
          });
        }
      } else {
        return;
      }
    } catch (e) {
      console.log("Error delegating token: ", e);
      throw e;
    }
  }

  async function submitTransaction<T>(
    submission: Promise<any>,
    options: {
      notificationMode?: string;
      notificationTitle?: string;
      successMessage?: string;
      failureMessage?: string;
    } = {}
  ): Promise<T | undefined> {
    try {
      // submission calls `sign` internally which handles setting TxStatus
      setCleanTxMessage(undefined);
      setTxStatus(TxStatus.BUILDING);
      let result = await submission;

      setTxHash(result.hash);
      const isOk = result.result.isOk();
      setNotificationMode("flash");
      if (isOk) {
        console.log("Successfully submitted transaction: ", result.hash);
        setNotificationMode(options.notificationMode || "flash");
        setShowNotification(true);
        setNotificationTitle(
          options.notificationTitle || "Transaction Successful"
        );
        setTxMessage(
          options.successMessage || "Transaction submitted successfully"
        );
        setTxStatus(TxStatus.SUCCESS);
      } else {
        const error = result.result.error;
        const message =
          (GovernorErrors as any)[error.type.toString()]?.message ||
          (VotesErrors as any)[error.type.toString()]?.message ||
          "";
        console.log({ error, result, type: error.type, message });
        console.log("Failed submitted transaction: ", result.hash);
        setCleanTxMessage(
          options.failureMessage
            ? `${`${options.failureMessage} | ${message}`} `
            : error.message
        );
        setNotificationTitle("Transaction Failed");
        setTxStatus(TxStatus.FAIL);
        setShowNotification(true);
      }
      return result;
    } catch (e: any) {
      console.error("Failed submitting transaction: ", e);
      setCleanTxMessage(options.failureMessage || e?.message);
      setNotificationTitle("Transaction Failed");
      setShowNotification(true);
      setTxStatus(TxStatus.FAIL);
      return undefined;
    }
  }

  function clearLastTx() {
    setTxStatus(TxStatus.NONE);
    setTxHash(undefined);
    setTxMessage(undefined);
    setShowNotification(false);
    setNotificationMode("");
    setNotificationTitle("");
  }

  function closeNotification() {
    setShowNotification(false);
    clearLastTx();
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        txStatus,
        lastTxHash: txHash,
        lastTxMessage: txMessage,
        isLoading:
          txStatus === TxStatus.BUILDING ||
          txStatus === TxStatus.SIGNING ||
          txStatus === TxStatus.SUBMITTING,
        network,
        connect,
        disconnect,
        clearLastTx,
        vote,
        createProposal,
        executeProposal,
        closeProposal,
        cancelProposal,
        rpcServer,
        submitTransaction,
        setNetwork,
        closeNotification,
        getVoteTokenBalance,
        getVotingPowerByProposal,
        getTokenBalance,
        wrapToken,
        unwrapToken,
        getUserVoteByProposalId,
        getTotalVotesByProposal,
        getDelegate,
        delegate,
        notificationMode,
        showNotification,
        notificationTitle,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("Component rendered outside the provider tree");
  }

  return context;
};
