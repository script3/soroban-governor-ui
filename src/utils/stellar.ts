import {
  Account,
  BASE_FEE,
  Horizon,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

export type SorobanResponse =
  | rpc.Api.GetTransactionResponse
  | rpc.Api.SimulateTransactionResponse
  | rpc.Api.SendTransactionResponse;

export interface TxOptions {
  sim: boolean;
  pollingInterval: number;
  timeout: number;
  builderOptions: TransactionBuilder.TransactionBuilderOptions;
}

export interface Network {
  rpc: string;
  passphrase: string;
  maxConcurrentRequests?: number;
  opts?: Horizon.Server.Options;
}

export interface LedgerEntry<T> {
  entry: T;
  restoreResponse?: rpc.Api.SimulateTransactionRestoreResponse;
}

/**
 * Simulate a soroban operation and return the result
 * @param stellarRpc - The stellar rpc server to simulate the operation against
 * @param operation - The operation to simulate as a base64 XDR string
 * @returns The result of the simulation
 */
export async function simulateOperation(
  stellarRpc: rpc.Server,
  operation: string
): Promise<rpc.Api.SimulateTransactionResponse> {
  const account = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "123"
  );
  const transaction = new TransactionBuilder(account, {
    networkPassphrase:
      process.env.NEXT_PUBLIC_PASSPHRASE || "Test SDF Network ; September 2015",
    fee: BASE_FEE,
    timebounds: {
      minTime: 0,
      maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
    },
  })
    .addOperation(xdr.Operation.fromXDR(operation, "base64"))
    .build();
  return await stellarRpc.simulateTransaction(transaction);
}

export function parseResultFromXDRString(result: string): any {
  const val = scValToNative(xdr.ScVal.fromXDR(result, "base64"));
  return val;
}

export function parseErrorFromSimError(error: string): string {
  if (error.includes("Event log")) {
    return error.substring(0, error.indexOf("Event log"));
  } else {
    return error.length > 100 ? error.substring(0, 100) + "..." : error;
  }
}

export const jsonReplacer = (key: any, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()),
    };
  } else if (typeof value == "bigint") {
    return {
      dataType: "BigInt",
      value: value.toString(),
    };
  } else {
    return value;
  }
};
