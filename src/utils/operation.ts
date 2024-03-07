import {
  ContractResult,
  Resources,
  ContractError,
  ContractErrorType,
} from "soroban-governor-js-sdk";
import {
  Account,
  Asset,
  Horizon,
  Operation,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
export type SorobanResponse =
  | SorobanRpc.Api.GetTransactionResponse
  | SorobanRpc.Api.SimulateTransactionResponse
  | SorobanRpc.Api.SendTransactionResponse;

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

/**
 * Invoke a `InvokeHostFunction` operation against the Stellar network.
 *
 * @param source - The source of the transaction.
 * @param sign - The function for signing the transaction.
 * @param network - The network and rpc to invoke the transaction on.
 * @param txOptions - The options for the transaction.
 * @param parse - The function for parsing the result of the transaction.
 * @param operation - The invokeHostFunction operation to invoke.
 * @returns The result of the transaction as a ContractResult.
 */
export async function invokeOperation<T>(
  source: string,
  sign: (txXdr: string) => Promise<string>,
  network: Network,
  txOptions: TxOptions,
  parse: any,
  operation: xdr.Operation | string
): Promise<ContractResult<any> | ContractError> {
  // create TX
  const rpc = new SorobanRpc.Server(network.rpc, network.opts);
  let source_account: Account;
  if (txOptions.sim) {
    // no need to fetch the source account for a simulation, use a random sequence number
    source_account = new Account(source, "123");
  } else {
    source_account = await rpc.getAccount(source);
  }
  const tx_builder = new TransactionBuilder(
    source_account,
    txOptions.builderOptions
  );
  if (typeof operation === "string") {
    operation = xdr.Operation.fromXDR(operation, "base64");
  }

  tx_builder.addOperation(operation);
  const tx = tx_builder.build();

  // simulate the TX
  const simulation_resp = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simulation_resp)) {
    // No resource estimation available from a simulation error. Allow the response formatter
    // to fetch the error.
    const empty_resources = new Resources(0, 0, 0, 0, 0, 0, 0);
    return ContractResult.fromSimulationResponse(
      simulation_resp,
      tx.hash().toString("hex"),
      empty_resources,
      parse
    );
  } else if (txOptions.sim) {
    // Only simulate the TX. Assemble the TX to borrow the resource estimation algorithm in
    // `assembleTransaction` and return the simulation results.
    const prepped_tx = SorobanRpc.assembleTransaction(
      tx,
      simulation_resp
    ).build();
    const resources = Resources.fromTransaction(prepped_tx.toXDR());
    return ContractResult.fromSimulationResponse(
      simulation_resp,
      prepped_tx.hash().toString("hex"),
      resources,
      parse
    );
  }

  // assemble and sign the TX
  const assemble_tx = SorobanRpc.assembleTransaction(
    tx,
    simulation_resp
  ).build();
  const signed_xdr_string = await sign(assemble_tx.toXDR());
  const signed_tx = new Transaction(signed_xdr_string, network.passphrase);
  const tx_hash = signed_tx.hash().toString("hex");
  const resources = Resources.fromTransaction(assemble_tx.toEnvelope());

  // submit the TX
  let response: SorobanResponse = await rpc.sendTransaction(signed_tx);
  let status: string = response.status;
  // Poll this until the status is not "NOT_FOUND"
  const pollingStartTime = Date.now();
  while (status === "PENDING" || status === "NOT_FOUND") {
    if (pollingStartTime + txOptions.timeout < Date.now()) {
      return new ContractError(
        ContractErrorType.UnknownError,
        `Transaction timed out with status ${status}`
      );
    }
    await new Promise((resolve) =>
      setTimeout(resolve, txOptions.pollingInterval)
    );
    // See if the transaction is complete
    response = await rpc.getTransaction(tx_hash);
    status = response.status;
  }
  console.log({
    response,
    type: typeof response,
  });
  const result = ContractResult.fromTransactionResponse(
    response as SorobanRpc.Api.GetTransactionResponse,
    tx_hash,
    resources,
    parse
  );
  console.log({ result });
  return result;
}
