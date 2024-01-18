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
