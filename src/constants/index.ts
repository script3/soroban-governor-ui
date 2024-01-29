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
