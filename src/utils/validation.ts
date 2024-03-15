import { Calldata, GovernorSettings, Val } from "soroban-governor-js-sdk";
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
    typeof obj === "object" &&
    obj !== null &&
    "value" in obj &&
    "type" in obj &&
    typeof obj.value === "string" &&
    /* Additional checks for type property based on your requirements */
    true  // Adjust this line based on your actual checks for the 'type' property
  );
}

export function isCalldata(obj: any): obj is Calldata {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "args" in obj &&
    "auths" in obj &&
    "contract_id" in obj &&
    "function" in obj &&
    Array.isArray(obj.args) &&
    Array.isArray(obj.auths) &&
    obj.args.every(isVal) &&
    obj.auths.every(isCalldata) &&
    typeof obj.contract_id === "string" &&
    typeof obj.function === "string"
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

export function parseCallData(calldataObj: any): Calldata | null {

  if (isCalldata(calldataObj)) {
    return new Calldata(
      calldataObj.contract_id,
      calldataObj.function,
      calldataObj.args.map((arg:any) => new Val(arg.value, arg.type)),
      calldataObj.auths.map((auth:any) => parseCallData(auth)).filter((auth:any) => auth !== null) as Calldata[]
      )
  }

  return null;
}


export function isGovernorSettings(obj: any): obj is GovernorSettings {
  return (
      typeof obj === "object" &&
      obj !== null &&
      "council" in obj && typeof obj.council === "string" &&
      "counting_type" in obj && typeof obj.counting_type === "number" &&
      "grace_period" in obj && typeof obj.grace_period === "number" &&
      "proposal_threshold" in obj && typeof obj.proposal_threshold === "bigint" &&
      "quorum" in obj && typeof obj.quorum === "number" &&
      "timelock" in obj && typeof obj.timelock === "number" &&
      "vote_delay" in obj && typeof obj.vote_delay === "number" &&
      "vote_period" in obj && typeof obj.vote_period === "number" &&
      "vote_threshold" in obj && typeof obj.vote_threshold === "number"
  );
}

export function isGovernorSettingsString(str: string): boolean {
  try {
      const data: GovernorSettings = JSON.parse(str);
      return isGovernorSettings(data);
  } catch (error) {
      return false;
  }
}
