import { ProposalStatusExt } from "@/types";

export const ProposalStatusText = {
  [ProposalStatusExt.Pending]: "Pending",
  [ProposalStatusExt.Active]: "Active",
  [ProposalStatusExt.Successful]: "Successful",
  [ProposalStatusExt.Defeated]: "Defeated",
  [ProposalStatusExt.Expired]: "Expired",
  [ProposalStatusExt.Executed]: "Executed",
  [ProposalStatusExt.Canceled]: "Canceled",
  [ProposalStatusExt.Open]: "Open",
};

export enum ProposalActionEnum {
  CALLDATA = "Calldata",
  UPGRADE = "Upgrade",
  SETTINGS = "Settings",
  COUNCIL = "Council",
  SNAPSHOT = "Snapshot",
}

export const classByProposalAction = {
  [ProposalActionEnum.CALLDATA]: "!bg-blue-800 !text-blue-300",
  [ProposalActionEnum.UPGRADE]: "!bg-fuchsia-800 !text-fuchsia-300",
  [ProposalActionEnum.SETTINGS]: "!bg-neutral-700 !text-neutral-300",
  [ProposalActionEnum.COUNCIL]: "!bg-green-800 !text-green-300",
  [ProposalActionEnum.SNAPSHOT]: "!bg-amber-800 !text-amber-300",
};

export type ObType = { [key: string]: string };
export const classByStatus: ObType = {
  [ProposalStatusExt.Successful]: "!bg-green-400",
  [ProposalStatusExt.Active]: "!bg-green-500",
  [ProposalStatusExt.Open]: "!bg-blue-500",
  [ProposalStatusExt.Defeated]: "!bg-red-500",
  [ProposalStatusExt.Canceled]: "!bg-gray-500",
  [ProposalStatusExt.Expired]: "!bg-gray-500",
  [ProposalStatusExt.Executed]: "!bg-gray-500",
  [ProposalStatusExt.Pending]: "!bg-amber-800",
};

export const EighteenDecimals = 10_000_000_000_000_000_000;
export const SevenDecimals = 10_000_000_000;
export const CALLDATA_PLACEHOLDER = `JSON string of the function arguments.\nExample: 
{
  "args": [
    {
      "value": "CBGZFBCHOYDGBSYNHPAETPE7TLISZXN5E6Q3VIDUVUWV74NODINIZKLV",
      "type": {
        "type": "address"
      }
    },
    {
      "value": "GDR7FEEN6G4VS3QMTHNCN567VZKZ763PCZSTCZG62TCF5LFH7CPJEZAC",
      "type": {
        "type": "address"
      }
    },
    {
      "value": "10123456",
      "type": {
        "type": "i128"
      }
    }
  ],
  "auths": [],
  "contract_id": "CCZFATFQOJS2DYOAXXUBEKQIHZAPZPR2SO32BVSUW7GOZQF3LSTWJTK4",
  "function": "transfer"
}`;

export const GOVERNOR_SETTINGS_PLACEHOLDER = `{\n\tcouncil: "GBSXDX3C3X7TT2E23AAMYRAIWSY2MRDX73V5X2CKUZ44H2KJQQV2AHMB",\n\tcounting_type: 2,\n\tgrace_period: 17280 * 7,\n\tproposal_threshold: 1000000000,\n\tquorum: 500,\n\ttimelock: 1440,\n\tvote_delay: 720,\n\tvote_period: 5760,\n\tvote_threshold: 5100\n\t}`;
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

export const DUMMY_ADDRESS =
  "GANXGJV2RNOFMOSQ2DTI3RKDBAVERXUVFC27KW3RLVQCLB3RYNO3AAI4";
