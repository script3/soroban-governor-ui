import { Calldata, SubCalldata } from "soroban-governor-js-sdk";

// Validation function
export function isCalldata(obj: any): obj is Calldata {
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

// Validation function for SubCalldata
export function isSubCalldataArray(arr: any): arr is SubCalldata[] {
  return Array.isArray(arr) && arr.every(isSubCalldata);
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
