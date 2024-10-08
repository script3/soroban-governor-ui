export function formatNumber(number: number, formatter?: Intl.NumberFormat) {
  formatter = formatter || defaultNumberFormatter;

  return formatter.format(number);
}

const defaultNumberFormatter = getNumberFormatter(
  // format with two decimal places
  { maximumFractionDigits: 2 }
);

export function getNumberFormatter(options?: object) {
  return new Intl.NumberFormat(
    // currently we are using only english number formatting because other
    // languages can result in very different string length, which we need to deal with.
    // (en: 10.2k, de: 10.200)
    "en", // currentLocale.value,
    options || { notation: "standard" }
  );
}
/**
 * Format a number as a balance
 * @dev - Inspired by Aave's FormattedNumber:
 *        https://github.com/aave/interface/blob/main/src/components/primitives/FormattedNumber.tsx
 * @param amount - The number being converted to a balance
 * @param decimals - The number of decimals to display (required if amount is bigint)
 * @returns string in the form of a formatted balance. Does not include units.
 */
export function toBalance(
  amount: bigint | number | undefined,
  decimals?: number | undefined
): string {
  if (amount == undefined) {
    return "--";
  }
  let numValue: number;
  if (decimals !== undefined) {
    numValue = Number(amount) / 10 ** decimals;
  } else if (typeof amount === "number") {
    numValue = amount;
  } else {
    console.error(
      "Invalid toBalance input. Must provide decimals if amount is a bigint."
    );
    return "";
  }

  let visibleDecimals = 0;
  if (numValue === 0) {
    visibleDecimals = 0;
  } else {
    if (numValue >= 10) {
      visibleDecimals = 2;
    } else {
      visibleDecimals = Math.min(decimals ?? 7, 7);
    }
  }

  if (numValue === 0) {
    return "0";
  }

  const absValue = Math.abs(numValue);
  if (absValue < 10) {
    return numValue.toFixed(visibleDecimals);
  } else if (absValue < 10000) {
    return numValue.toFixed(2);
  }

  const minValue = 10 ** -(visibleDecimals as number);
  const isSmallerThanMin =
    numValue !== 0 && Math.abs(numValue) < Math.abs(minValue);
  let adjAmount = isSmallerThanMin ? minValue : numValue;

  const bnValue = numValue;

  const integerPlaces = bnValue.toFixed(0).length;
  const postfixIndex = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1
  );
  adjAmount = numValue / Math.pow(10, 3 * postfixIndex);

  const formattedStr = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: visibleDecimals,
    minimumFractionDigits: visibleDecimals,
  }).format(adjAmount);
  return `${formattedStr}${POSTFIXES[postfixIndex]}`;
}

const POSTFIXES = ["", "k", "M", "B", "T", "P", "E", "Z", "Y"];

export function scaleNumberToBigInt(input: string, decimals: number): bigint {
  let scaled_input;
  if (input.includes(".")) {
    let [base, decimal] = input.split(".");
    scaled_input = `${base}${decimal}${"0".repeat(decimals - decimal.length)}`;
  } else {
    scaled_input = `${input}${"0".repeat(decimals)}`;
  }
  return BigInt(scaled_input);
}

export function bigintToString(input: bigint, decimals: number): string {
  let str = input.toString();
  // Pad with zeros
  while (str.length <= decimals) {
    str = "0" + str;
  }
  const index = str.length - decimals;
  str = str.slice(0, index) + "." + str.slice(index);
  return str;
}
