import {
  AlbedoModule,
  FreighterModule,
  ISupportedWallet,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit/index";

import {
  BondingVotesContract,
  ContractError,
  ContractErrorType,
  GovernorContract,
  parseError,
  ProposalAction,
  TokenVotesContract,
} from "@script3/soroban-governor-sdk";
import {
  BASE_FEE,
  Operation,
  rpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import React, { useContext, useEffect, useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  txStatus: TxStatus;
  lastTxHash: string | undefined;
  lastTxMessage: string | undefined;
  notificationMode: string;
  showNotification: boolean;
  notificationTitle: string;
  showNotificationLink: boolean;
  isLoading: boolean;
  network: Network;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearLastTx: () => void;
  rpcServer: () => rpc.Server;
  restore: (
    restoreResponse: rpc.Api.SimulateTransactionRestoreResponse
  ) => Promise<rpc.Api.GetSuccessfulTransactionResponse | undefined>;
  vote: (
    proposalId: number,
    support: number,
    governorAddress: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  createProposal: (
    title: string,
    description: string,
    action: ProposalAction,
    governorAddress: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  executeProposal: (
    proposalId: number,
    governorAddress: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  closeProposal: (
    proposalId: number,
    governorAddress: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  cancelProposal: (
    proposalId: number,
    governorAddress: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  wrapToken: (
    voteTokenAddress: string,
    amount: bigint
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  unwrapToken: (
    voteTokenAddress: string,
    amount: bigint
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  claimEmissions: (
    voteTokenAddress: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
  delegate: (
    voteTokenAddress: string,
    addressToDelegate: string
  ) => Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  >;
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
  opts?: rpc.Server.Options;
}

const walletKit: StellarWalletsKit = new StellarWalletsKit({
  network: (process.env.NEXT_PUBLIC_PASSPHRASE ||
    "Test SDF Network ; September 2015") as WalletNetwork,
  selectedWalletId: XBULL_ID,
  modules: [
    new xBullModule(),
    new FreighterModule(),
    new LobstrModule(),
    new AlbedoModule(),
  ],
});

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
  const [showNotificationLink, setShowNotificationLink] =
    useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txMessage, setTxMessage] = useState<string | undefined>(undefined);
  const [network, setStateNetwork] = useState<Network>({
    rpc:
      process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
    passphrase:
      process.env.NEXT_PUBLIC_PASSPHRASE || "Test SDF Network ; September 2015",
    opts: undefined,
  });

  // wallet state
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    if (!connected && !!autoConnect && autoConnect !== "false") {
      // @dev: timeout ensures chrome has the ability to load extensions
      setTimeout(() => {
        walletKit.setWallet(autoConnect);
        handleSetWalletAddress();
      }, 1000);
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
      const { address: publicKey } = await walletKit.getAddress();
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
    return new rpc.Server(network.rpc, network.opts);
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
        let { signedTxXdr: result } = await walletKit.signTransaction(xdr, {
          address: walletAddress,
          networkPassphrase: network.passphrase as WalletNetwork,
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
    governorAddress: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected) {
        let governorClient = new GovernorContract(governorAddress);
        let voteOperation = governorClient.vote({
          voter: walletAddress,
          proposal_id: proposalId,
          support,
        });
        return await submitOperation(voteOperation, {
          notificationMode: "modal",
          notificationTitle: "Your vote is in!",
          successMessage: "Your vote has been submitted successfully",
        });
      }
    } catch (e) {
      console.error("Error invoking vote: ", e);
    }
    return undefined;
  }

  async function createProposal(
    title: string,
    description: string,
    action: ProposalAction,
    governorAddress: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected) {
        let governorClient = new GovernorContract(governorAddress);
        let proposeOperation = governorClient.propose({
          creator: walletAddress,
          title,
          description,
          action,
        });
        return await submitOperation(proposeOperation, {
          notificationMode: "flash",
          notificationTitle: "Proposal created",
          successMessage: "Proposal created",
          failureMessage: "Failed to create proposal",
        });
      }
    } catch (e) {
      console.error("Error creating proposal: ", e);
    }
    return undefined;
  }

  async function executeProposal(
    proposalId: number,
    governorAddress: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected) {
        let governorClient = new GovernorContract(governorAddress);

        let executeOperation = governorClient.execute({
          proposal_id: proposalId,
        });
        return await submitOperation(executeOperation, {
          notificationMode: "flash",
          notificationTitle: "Proposal executed",
          successMessage: "Proposal executed",
          failureMessage: "Failed to execute proposal",
        });
      }
    } catch (e) {
      console.error("Error executing proposal: ", e);
    }
    return undefined;
  }

  async function closeProposal(
    proposalId: number,
    governorAddress: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected) {
        let governorClient = new GovernorContract(governorAddress);
        let closeOperation = governorClient.close({
          proposal_id: proposalId,
        });
        return await submitOperation(closeOperation, {
          notificationMode: "flash",
          notificationTitle: "Proposal closed",
          successMessage: "Proposal closed",
          failureMessage: "Failed to close proposal",
        });
      }
    } catch (e) {
      console.error("Error closing proposal: ", e);
    }
    return undefined;
  }

  async function cancelProposal(
    proposalId: number,
    governorAddress: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected) {
        let governorClient = new GovernorContract(governorAddress);
        let cancelOperation = governorClient.cancel({
          from: walletAddress,
          proposal_id: proposalId,
        });
        return await submitOperation(cancelOperation, {
          notificationMode: "flash",
          notificationTitle: "Proposal cancelled",
          successMessage: "Proposal cancelled",
          failureMessage: "Failed to cancel proposal",
        });
      }
    } catch (e) {
      console.error("Error cancelling proposal: ", e);
    }
    return undefined;
  }

  async function wrapToken(
    voteTokenAddress: string,
    amount: bigint
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected && walletAddress) {
        let votesClient = new BondingVotesContract(voteTokenAddress);
        let proposeOperation = votesClient.deposit({
          from: walletAddress,
          amount,
        });
        return await submitOperation(proposeOperation, {
          notificationMode: "flash",
          notificationTitle: "Tokens successfully bonded",
          successMessage: "Tokens successfully bonded",
          failureMessage: "Failed to bond tokens",
        });
      }
    } catch (e) {
      console.error("Error bonding token: ", e);
    }
    return undefined;
  }

  async function unwrapToken(
    voteTokenAddress: string,
    amount: bigint
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected && walletAddress) {
        let votesClient = new BondingVotesContract(voteTokenAddress);
        let withdrawOperation = votesClient.withdraw({
          from: walletAddress,
          amount,
        });
        return await submitOperation(withdrawOperation, {
          notificationMode: "flash",
          notificationTitle: "Tokens successfully unbonded",
          successMessage: "Tokens successfully unbonded",
          failureMessage: "Failed to unbond tokens",
        });
      }
    } catch (e) {
      console.error("Error unbonding token: ", e);
    }
    return undefined;
  }

  async function claimEmissions(
    voteTokenAddress: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected && walletAddress) {
        let votesClient = new BondingVotesContract(voteTokenAddress);
        let claimOperation = votesClient.claim({
          address: walletAddress,
        });
        return await submitOperation(claimOperation, {
          notificationMode: "flash",
          notificationTitle: "Emissions successfully claimed",
          successMessage: "Emissions successfully claimed",
          failureMessage: "Failed to claim emissions",
        });
      }
    } catch (e) {
      console.error("Error claiming emissions: ", e);
    }
    return undefined;
  }

  async function delegate(
    voteTokenAddress: string,
    addressToDelegate: string
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      if (connected && walletAddress) {
        let votesClient = new TokenVotesContract(voteTokenAddress);
        let delegateOperation = votesClient.delegate({
          account: walletAddress,
          delegatee: addressToDelegate,
        });
        return await submitOperation(delegateOperation, {
          notificationMode: "flash",
          notificationTitle: "Succesfully delegated",
          successMessage: "Succesfully delegated",
          failureMessage: "Failed to delegate",
        });
      }
    } catch (e) {
      console.error("Error delegating votes: ", e);
    }
    return undefined;
  }

  async function submitTransaction(
    transaction: Transaction,
    options: {
      notificationMode?: string;
      notificationTitle?: string;
      successMessage?: string;
      failureMessage?: string;
    } = {}
  ): Promise<rpc.Api.GetSuccessfulTransactionResponse | undefined> {
    try {
      const stellarRpc = rpcServer();
      setCleanTxMessage(undefined);
      setTxStatus(TxStatus.SUBMITTING);
      setNotificationMode("flash");
      setTxHash(transaction.hash().toString("hex"));

      let send_tx_response = await stellarRpc.sendTransaction(transaction);
      let curr_time = Date.now();

      // Attempt to send the transaction and poll for the result
      while (
        send_tx_response.status !== "PENDING" &&
        Date.now() - curr_time < 5000
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        send_tx_response = await stellarRpc.sendTransaction(transaction);
      }
      const hash = send_tx_response.hash;

      if (send_tx_response.status !== "PENDING") {
        let error = parseError(send_tx_response);
        console.error("Failed to send transaction: ", hash, error);
        setCleanTxMessage(
          options.failureMessage
            ? `${`${options.failureMessage} | ${
                ContractErrorType[error.type]
              }`} `
            : ContractErrorType[error.type]
        );
        setTxStatus(TxStatus.FAIL);
        setShowNotification(true);
        return undefined;
      }

      let get_tx_response = await stellarRpc.getTransaction(hash);
      curr_time = Date.now();
      while (
        get_tx_response.status === "NOT_FOUND" &&
        Date.now() - curr_time < 10000
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        get_tx_response = await stellarRpc.getTransaction(hash);
      }

      setTxHash(hash);
      if (get_tx_response.status === "SUCCESS") {
        setTxStatus(TxStatus.SUCCESS);
        setNotificationMode(options.notificationMode || "flash");
        setShowNotification(true);
        setNotificationTitle(
          options.notificationTitle || "Transaction Successful"
        );
        setTxMessage(
          options.successMessage || "Transaction submitted successfully"
        );
        setTxStatus(TxStatus.SUCCESS);
        setShowNotificationLink(true);

        return get_tx_response;
      } else {
        let error = parseError(get_tx_response);
        if (error.type < 0) {
          setShowNotificationLink(true);
        } else {
          setShowNotificationLink(false);
        }
        setNotificationTitle("Transaction Failed");
        setCleanTxMessage(
          options.failureMessage
            ? `${`${options.failureMessage} | ${
                ContractErrorType[error.type]
              }`} `
            : ContractErrorType[error.type]
        );
        setTxStatus(TxStatus.FAIL);
        setShowNotification(true);
        return undefined;
      }
    } catch (e: any) {
      console.error("Failed to submit transaction: ", e);
      setCleanTxMessage(options.failureMessage || e?.message);
      setNotificationTitle("Transaction Failed");
      setShowNotification(true);
      setTxStatus(TxStatus.FAIL);
      return undefined;
    }
  }

  async function submitOperation(
    operation: string,
    options: {
      notificationMode?: string;
      notificationTitle?: string;
      successMessage?: string;
      failureMessage?: string;
    } = {}
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.SimulateTransactionRestoreResponse
    | undefined
  > {
    try {
      setNotificationMode("flash");
      setTxStatus(TxStatus.BUILDING);
      const stellarRpc = rpcServer();
      const account = await stellarRpc.getAccount(walletAddress);
      const tx_builder = new TransactionBuilder(account, {
        networkPassphrase: network.passphrase,
        fee: BASE_FEE,
        timebounds: {
          minTime: 0,
          maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
        },
      }).addOperation(xdr.Operation.fromXDR(operation, "base64"));
      const transaction = tx_builder.build();
      const simResponse = await stellarRpc.simulateTransaction(transaction);
      if (
        rpc.Api.isSimulationSuccess(simResponse) &&
        !rpc.Api.isSimulationRestore(simResponse)
      ) {
        const assembled_tx = rpc
          .assembleTransaction(transaction, simResponse)
          .build();
        const signedTx = await sign(assembled_tx.toXDR());
        const tx = new Transaction(signedTx, network.passphrase);
        return await submitTransaction(tx, options);
      } else {
        console.error("Failed to simulate transaction: ", simResponse);
        let error = rpc.Api.isSimulationRestore(simResponse)
          ? new ContractError(ContractErrorType.InvokeHostFunctionEntryArchived)
          : parseError(simResponse);
        setNotificationTitle("Simulation Failed");
        setCleanTxMessage(
          options.failureMessage
            ? `${`${options.failureMessage} | ${
                ContractErrorType[error.type]
              }`} `
            : ContractErrorType[error.type]
        );
        setShowNotification(true);
        setTxStatus(TxStatus.FAIL);
        if (rpc.Api.isSimulationRestore(simResponse)) {
          return simResponse;
        }
        return undefined;
      }
    } catch (e: any) {
      console.error("Failed to submit transaction: ", e);
      setCleanTxMessage(options.failureMessage || e?.message);
      setNotificationTitle("Transaction Failed");
      setShowNotification(true);
      setTxStatus(TxStatus.FAIL);
      return undefined;
    }
  }

  async function restore(
    sim: rpc.Api.SimulateTransactionRestoreResponse
  ): Promise<rpc.Api.GetSuccessfulTransactionResponse | undefined> {
    const stellarRpc = rpcServer();
    let account = await stellarRpc.getAccount(walletAddress);
    setTxStatus(TxStatus.BUILDING);
    let fee = parseInt(sim.restorePreamble.minResourceFee) + parseInt(BASE_FEE);
    let restore_tx = new TransactionBuilder(account, { fee: fee.toString() })
      .setNetworkPassphrase(network.passphrase)
      .setTimeout(0)
      .setSorobanData(sim.restorePreamble.transactionData.build())
      .addOperation(Operation.restoreFootprint({}))
      .build();
    let signed_restore_tx = new Transaction(
      await sign(restore_tx.toXDR()),
      network.passphrase
    );
    return await submitTransaction(signed_restore_tx, {
      successMessage: "Successfully restored ledger entries",
      failureMessage: "Failed to restore entries",
    });
  }

  function clearLastTx() {
    setTxStatus(TxStatus.NONE);
    setTxHash(undefined);
    setTxMessage(undefined);
    setShowNotification(false);
    setNotificationMode("");
    setNotificationTitle("");
    setShowNotificationLink(false);
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
        restore,
        vote,
        createProposal,
        executeProposal,
        closeProposal,
        cancelProposal,
        rpcServer,
        setNetwork,
        closeNotification,
        wrapToken,
        unwrapToken,
        claimEmissions,
        delegate,
        notificationMode,
        showNotification,
        notificationTitle,
        showNotificationLink,
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
