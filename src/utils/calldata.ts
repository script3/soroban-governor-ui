import { Calldata, Val } from "@script3/soroban-governor-sdk";

/**
 * Compare two arrays of Calldata for deep equality
 * @param calldata1 First array of Calldata objects
 * @param calldata2 Second array of Calldata objects
 * @returns boolean indicating if the arrays are deeply equal
 */
export function compareCalldataArrays(
  calldata1: Calldata[] | undefined,
  calldata2: Calldata[] | undefined
): boolean {
  // Handle undefined cases
  if (calldata1 === undefined && calldata2 === undefined) return true;
  if (calldata1 === undefined || calldata2 === undefined) return false;

  // Check if arrays have the same length
  if (calldata1.length !== calldata2.length) return false;

  // Compare each Calldata object
  return calldata1.every((data1, index) => {
    const data2 = calldata2[index];
    return compareCalldata(data1, data2);
  });
}

/**
 * Compare two Calldata objects for deep equality
 * @param data1 First Calldata object
 * @param data2 Second Calldata object
 * @returns boolean indicating if the objects are deeply equal
 */
function compareCalldata(data1: Calldata, data2: Calldata): boolean {
  // Compare simple properties
  if (data1.contract_id !== data2.contract_id) return false;
  if (data1.function !== data2.function) return false;

  // Compare args array
  if (data1.args.length !== data2.args.length) return false;
  const argsEqual = data1.args.every((arg1, i) => {
    const arg2 = data2.args[i];
    return compareVal(arg1, arg2);
  });
  if (!argsEqual) return false;

  // Compare nested auths array recursively
  return compareCalldataArrays(data1.auths, data2.auths);
}

/**
 * Compare two Val objects for deep equality
 * @param val1 First Val object
 * @param val2 Second Val object
 * @returns boolean indicating if the objects are deeply equal
 */
function compareVal(val1: Val, val2: Val): boolean {
  // Compare types
  if (val1.type?.type !== val2.type?.type) return false;

  // For XDR types, compare the string values
  if (val1.type?.type === "xdr") {
    return val1.value === val2.value;
  }

  // For primitive types, use direct comparison
  if (typeof val1.value !== "object" || val1.value === null) {
    return val1.value === val2.value;
  }

  // For objects/arrays, use JSON stringify
  // This is a simplification - in a production environment you might want
  // a more robust way to handle complex nested objects
  return JSON.stringify(val1.value) === JSON.stringify(val2.value);
}
