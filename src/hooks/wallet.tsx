import {
  FreighterModule,
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit/build/main";

import React, { useContext, useEffect, useState } from "react";
import { SorobanRpc, Transaction, xdr } from "stellar-sdk";
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
  lastTxFailure: string | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearLastTx: () => void;
  submitTransaction: <T>(submission: Promise<any>) => Promise<T | undefined>;
  rpcServer: () => SorobanRpc.Server;
  setNetwork: (
    newUrl: string,
    newPassphrase: string,
    newOpts: Network["opts"]
  ) => void;
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
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txFailure, setTxFailure] = useState<string | undefined>(undefined);
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

  function setFailureMessage(message: string | undefined) {
    if (message) {
      // some contract failures include diagnostic information. If so, try and remove it.
      let substrings = message.split("Event log (newest first):");
      if (substrings.length > 1) {
        setTxFailure(substrings[0].trimEnd());
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
        if (e === "User declined access") {
          setTxFailure("Transaction rejected by wallet.");
        } else if (typeof e === "string") {
          setTxFailure(e);
        }

        setTxStatus(TxStatus.FAIL);
        throw e;
      }
    } else {
      throw new Error("Not connected to a wallet");
    }
  }

  async function submitTransaction<T>(
    submission: Promise<any>
  ): Promise<T | undefined> {
    try {
      // submission calls `sign` internally which handles setting TxStatus
      setFailureMessage(undefined);
      setTxStatus(TxStatus.BUILDING);
      let result = await submission;
      setTxHash(result.hash);
      if (result.ok) {
        console.log("Successfully submitted transaction: ", result.hash);
        setTxStatus(TxStatus.SUCCESS);
      } else {
        console.log("Failed submitted transaction: ", result.hash);
        setFailureMessage(result.error?.message);
        setTxStatus(TxStatus.FAIL);
      }

      return result;
    } catch (e: any) {
      console.error("Failed submitting transaction: ", e);
      setFailureMessage(e?.message);
      setTxStatus(TxStatus.FAIL);
      return undefined;
    }
  }

  function clearLastTx() {
    setTxStatus(TxStatus.NONE);
    setTxHash(undefined);
    setTxFailure(undefined);
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        txStatus,
        lastTxHash: txHash,
        lastTxFailure: txFailure,
        connect,
        disconnect,
        clearLastTx,

        rpcServer,
        submitTransaction,
        setNetwork,
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
