import { Calldata, GovernorSettings, Val } from "@script3/soroban-governor-sdk";
import { Address } from "@stellar/stellar-sdk";
/** used this to be able to parse a json with no double quotes on properties */
import { parse } from "json5";

export function safeJSONParse(value: any) {
  try {
    if (typeof value === "object") {
      return { isValid: true, data: value };
    }

    const data = parse(value);
    return { isValid: true, data };
  } catch (e) {
    return { isValid: false, data: null };
  }
}
export function isVal(obj: any): obj is Val {
  return (
    typeof obj === "object" && obj !== null && "value" in obj && "type" in obj
  );
}

export function isCalldata(obj: any): obj is Calldata {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "args" in obj &&
    "contract_id" in obj &&
    "function" in obj &&
    Array.isArray(obj.args) &&
    obj.args.every(isVal) &&
    typeof obj.contract_id === "string" &&
    isContractId(obj.contract_id) &&
    typeof obj.function === "string" &&
    obj.function !== ""
  );
}

export function isCalldataString(str: string): boolean {
  const { data, isValid } = safeJSONParse(str);
  if (!isValid) {
    return false;
  }

  const condition = isCalldata(data);
  return condition;
}

export function isPreAuthCalldataString(str: string): boolean {
  const { data, isValid } = safeJSONParse(str);
  if (!isValid) {
    return false;
  }
  if (Array.isArray(data)) {
    return data.every((item: any) => isCalldata(item));
  }
  return false;
}

export function parseCallData(calldataObj: any): Calldata | null {
  if (isCalldata(calldataObj)) {
    return {
      contract_id: calldataObj.contract_id,
      function: calldataObj.function,
      args: calldataObj.args.map((arg: any): Val => {
        return { value: arg.value, type: arg.type };
      }),
      auths: calldataObj.auths
        .map((auth: any) => parseCallData(auth))
        .filter((auth: any) => auth !== null) as Calldata[],
    };
  }

  return null;
}

export function isValidGovernorSettings(settings: GovernorSettings): boolean {
  const ONE_DAY_LEDGERS = 17280;
  const ONE_HOUR_LEDGERS = 720;
  const BPS_SCALAR = 10_000;
  const MAX_VOTE_PERIOD = 7 * ONE_DAY_LEDGERS;
  const MIN_VOTE_PERIOD = ONE_HOUR_LEDGERS;
  const MAX_GRACE_PERIOD = 7 * ONE_DAY_LEDGERS;
  const MIN_GRACE_PERIOD = ONE_DAY_LEDGERS;
  const MIN_VOTE_THRESHOLD = 1;
  if (
    settings.vote_period > MAX_VOTE_PERIOD ||
    settings.vote_period < MIN_VOTE_PERIOD ||
    settings.grace_period < MIN_GRACE_PERIOD ||
    settings.grace_period > MAX_GRACE_PERIOD ||
    isMaxTimeExceeded(settings) ||
    settings.counting_type > 7 ||
    settings.proposal_threshold < MIN_VOTE_THRESHOLD ||
    settings.quorum > BPS_SCALAR - 100 ||
    settings.quorum < 10 ||
    settings.vote_threshold > BPS_SCALAR - 100 ||
    settings.vote_threshold < 10
  ) {
    return false;
  }
  return true;
}

export function isMaxTimeExceeded(settings: GovernorSettings): boolean {
  const ONE_DAY_LEDGERS = 17280;
  const MAX_PROPOSAL_LIFETIME = 31 * ONE_DAY_LEDGERS;
  return (
    settings.vote_delay +
      settings.vote_period +
      settings.timelock +
      settings.grace_period * 2 >
    MAX_PROPOSAL_LIFETIME
  );
}

export function isAddress(address: string) {
  try {
    Address.fromString(address);
    return true;
  } catch (error) {
    return false;
  }
}
export function isContractId(address: string) {
  const regex = /^C/;
  if (isAddress(address) && regex.test(address)) {
    return true;
  }
  return false;
}
