export enum ProposalStatusEnum {
  /// The proposal is pending and is not open for voting
  Pending = 0,
  /// The proposal is active and can be voted on
  Active = 1,
  /// The proposal was voted for. If the proposal is executable, the timelock begins once this state is reached.
  Successful = 2,
  /// The proposal was voted against
  Defeated = 3,
  /// The proposal did not reach quorum before the voting period ended
  Expired = 4,
  /// The proposal has been executed
  Executed = 5,
  /// The proposal has been canceled
  Canceled = 6,
}

export type ProposalStatus =
  | "Pending"
  | "Active"
  | "Defeated"
  | "Successful"
  | "Canceled"
  | "Expired"
  | "Executed";

export const ProposalStatusText = {
  [ProposalStatusEnum.Pending]: "Pending",
  [ProposalStatusEnum.Active]: "Active",
  [ProposalStatusEnum.Successful]: "Successful",
  [ProposalStatusEnum.Defeated]: "Defeated",
  [ProposalStatusEnum.Expired]: "Expired",
  [ProposalStatusEnum.Executed]: "Executed",
  [ProposalStatusEnum.Canceled]: "Canceled",
}

export enum ProposalActionEnum {
  CALLDATA = "Calldata",
  UPGRADE = "Upgrade",
  SETTINGS = "Settings",
  SNAPSHOT = "Snapshot"

}

export const classByProposalAction ={
  [ProposalActionEnum.CALLDATA]: "!bg-blue-800 text-blue-300",
  [ProposalActionEnum.UPGRADE]: "!bg-fuchsia-800 text-fuchsia-300",
  [ProposalActionEnum.SETTINGS]: "!bg-neutral-700 text-neutral-300",
  [ProposalActionEnum.SNAPSHOT]: "!bg-amber-800 text-amber-300",
}

export type ObType = { [key: string]: string };
export const classByStatus: ObType = {
  [ProposalStatusEnum.Successful]: "!bg-fuchsia-400",
  [ProposalStatusEnum.Active]: "!bg-green-500",
  [ProposalStatusEnum.Defeated]: "!bg-red-500",
  [ProposalStatusEnum.Canceled]: "!bg-gray-500",
  [ProposalStatusEnum.Expired]: "!bg-gray-500",
  [ProposalStatusEnum.Executed]: "!bg-gray-500",
  [ProposalStatusEnum.Pending]: "!bg-gray-500",

};
export const EighteenDecimals = 10_000_000_000_000_000_000;
export const SevenDecimals = 10_000_000_000;
export const CALLDATA_PLACEHOLDER = `JSON string of the function arguments.\nExample: {\n\targs: [\n\t\t{ value: 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S', type: 'address' },\n\t],\n\tcontract_id: 'CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI',\n\tfunction: 'balance',\n}`;
export const SUBCALLDATA_PLACEHOLDER = `JSON string of An array of calldata objects with function arguments.\nExample: [\n  {\n    args: [\n      { value: 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S', type: 'address' },\n    ],\n    contract_id: 'CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI',\n    function: 'balance',\n    sub_auth: [],\n  },\n]
`;
export const GOVERNOR_SETTINGS_PLACEHOLDER = `{\n\tcouncil: "GBSXDX3C3X7TT2E23AAMYRAIWSY2MRDX73V5X2CKUZ44H2KJQQV2AHMB",\n\tcounting_type: 2,\n\tgrace_period: 17280 * 7,\n\tproposal_threshold: 1000000000,\n\tquorum: 500,\n\ttimelock: 1440,\n\tvote_delay: 720,\n\tvote_period: 5760,\n\tvote_threshold: 5100\n\t}`
const x = {
  args: [
    {
      value: "GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S",
      type: "address",
    },
  ],
  contract_id: "CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI",
  function: "balance",
};

export const DUMMY_ADDRESS = 'GANXGJV2RNOFMOSQ2DTI3RKDBAVERXUVFC27KW3RLVQCLB3RYNO3AAI4'