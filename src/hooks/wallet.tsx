import { TxOptions, invokeOperation } from "@/utils/operation";
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
  Calldata,
  ContractResult,
  GovernorClient,
  SubCalldata,
  VotesClient,
  i128,
} from "soroban-governor-js-sdk";
import { SorobanRpc, scValToNative, xdr } from "stellar-sdk";
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
    calldata: Calldata,
    sub_calldata: Array<SubCalldata>,
    title: string,
    description: string,
    sim: boolean,
    governorAddress: string
  ) => Promise<bigint | undefined>;
  getVoteTokenBalance: (
    voteTokenAddress: string,
    sim: boolean
  ) => Promise<bigint>;
  getVotingPowerByProposal: (
    voteTokenAddress: string,
    proposalStart: number,
    sim: boolean
  ) => Promise<bigint>;
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
  const [autoConnect, setAutoConnect] = useState<string | undefined>(undefined);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);
  const [notificationMode, setNotificationMode] = useState<string>("");
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationTitle, setNotificationTitle] = useState<string>("");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txMessage, setTxMessage] = useState<string | undefined>(undefined);
  const [network, setStateNetwork] = useState<Network>({
    rpc: "https://soroban-testnet.stellar.org",
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
    if (!connected && autoConnect !== "false") {
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
        setTxMessage(substrings[0].trimEnd());
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
        let governorClient = new GovernorClient(governorAddress);
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
          governorClient.parsers.vote,
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
    calldata_: Calldata,
    sub_calldata_: Array<SubCalldata>,
    title: string,
    description: string,
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
        let governorClient = new GovernorClient(governorAddress);
        console.log({ walletAddress });

        let proposeOperation = governorClient.propose({
          creator: walletAddress,
          calldata_,
          sub_calldata_,
          title,
          description,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          governorClient.parsers.propose,
          proposeOperation
        );
        if (sim) {
          const sub = await submission;
          if (sub instanceof ContractResult) {
            return sub.result.unwrap();
          }
          return sub;
        } else {
          const result = await submitTransaction<bigint>(submission);
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
        let votesClient = new VotesClient(voteTokenAddress);
        console.log({ walletAddress });

        let votesOperation = votesClient.balance({
          id: walletAddress,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          votesClient.parsers.balance,
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
  async function getVotingPowerByProposal(
    voteTokenAddress: string,
    proposalStart: number,
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
        let votesClient = new VotesClient(voteTokenAddress);
        console.log({ walletAddress });

        let proposeOperation = votesClient.getPastVotes({
          user: walletAddress,
          sequence: proposalStart,
        });
        const submission = invokeOperation<xdr.ScVal>(
          walletAddress,
          sign,
          network,
          txOptions,
          votesClient.parsers.getVotes,
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
      console.log({ result });
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
        console.log("Failed submitted transaction: ", result.hash);
        setCleanTxMessage(options.failureMessage || result.error?.message);
        setNotificationTitle("Transaction Failed");
        setShowNotification(true);
        setTxStatus(TxStatus.FAIL);
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
        connect,
        disconnect,
        clearLastTx,
        vote,
        createProposal,
        rpcServer,
        submitTransaction,
        setNetwork,
        closeNotification,
        getVoteTokenBalance,
        getVotingPowerByProposal,
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
