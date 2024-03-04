import { Calldata, SubCalldata } from "soroban-governor-js-sdk";
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

// Validation function
export function isCalldata(obj: any): obj is Calldata {
  console.log({ obj });

  if (
    typeof obj === "object" &&
    obj !== null &&
    "args" in obj &&
    "contract_id" in obj &&
    "function" in obj &&
    Array.isArray(obj.args) &&
    obj.args.every(
      (arg: any) =>
        typeof arg === "object" &&
        "value" in arg &&
        "type" in arg &&
        typeof arg.value === "string" &&
        typeof arg.type === "string"
    ) &&
    typeof obj.contract_id === "string" &&
    typeof obj.function === "string"
  ) {
    return true;
  }
  return false;
}

export function isCalldataString(str: string): boolean {
  const { data, isValid } = safeJSONParse(str);
  if (!isValid) {
    return false;
  }
  if (data && typeof data === "object") {
    const len = Object.keys(data).length;
    if (len === 0) {
      return true;
    }
  }

  const condition = isCalldata(data);
  return condition;
}

// Validation function for SubCalldata
export function isSubCalldataArray(arr: any): arr is SubCalldata[] {
  return Array.isArray(arr) && arr.every(isSubCalldata);
}

export function isSubCalldataArrayString(str: string) {
  const { data, isValid } = safeJSONParse(str);
  if (!isValid) {
    return false;
  }
  if (Array.isArray(data) && data.length === 0) {
    return true;
  }
  return Array.isArray(data) && data.every(isSubCalldata);
}

function isSubCalldata(obj: any): obj is SubCalldata {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "args" in obj &&
    "contract_id" in obj &&
    "function" in obj &&
    "sub_auth" in obj &&
    Array.isArray(obj.args) &&
    obj.args.every(
      (arg: any) =>
        typeof arg === "object" &&
        "value" in arg &&
        "type" in arg &&
        typeof arg.value === "string" &&
        typeof arg.type === "string"
    ) &&
    typeof obj.contract_id === "string" &&
    typeof obj.function === "string" &&
    Array.isArray(obj.sub_auth) &&
    obj.sub_auth.every(isSubCalldata)
  );
}
