export enum ProposalStatusEnum {
  Pending = "Pending",
  Active = "Active",
  Defeated = "Defeated",
  Succeeded = "Succeeded",
  Queued = "Queued",
  Expired = "Expired",
  Executed = "Executed",
}

export type ProposalStatus =
  | "Pending"
  | "Active"
  | "Defeated"
  | "Succeeded"
  | "Queued"
  | "Expired"
  | "Executed";
export type ObType = { [key: string]: string };
export const classByStatus: ObType = {
  Succeeded: "bg-fuchsia-400",
  Active: "bg-green-500",
  Pending: "bg-neutral-500 ",
};
export const EighteenDecimals = 10_000_000_000_000_000_000;
export const CALLDATA_PLACEHOLDER = `JSON string of the function arguments.\nExample: {\n\targs: [\n\t\t{ value: 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S', type: 'address' },\n\t],\n\tcontract_id: 'CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI',\n\tfunction: 'balance',\n}`;
export const SUBCALLDATA_PLACEHOLDER = `JSON string of An array of calldata objects with function arguments.\nExample: [\n  {\n    args: [\n      { value: 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S', type: 'address' },\n    ],\n    contract_id: 'CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI',\n    function: 'balance',\n    sub_auth: [],\n  },\n]
`;
