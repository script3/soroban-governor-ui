/**
 * Wrapper functions for Intl.RelativeTimeFormat/NumberFormat
 * returning computed properties based on current locale from i18n
 */

import { ProposalStatusEnum } from "@/constants";

/**
 * This is needed since Intl still doesn't support durations:
 * https://github.com/tc39/proposal-intl-duration-format (hopefully soon!)
 *
 * The Intl.relativeTimeFormat API (same as basically all libraries like day.js, timeago.js)
 * only supports phrases like "5 hours ago" or "in 35 minutes". But these time durations can be phrased
 * differently, e.g. we also use "12 hours left" instead of "(ends) in 12 hours". For that you need
 * a simple duration formatter, that turns 3600 into "1 hour" and 180000 into "2 days". More granular
 * formats are possible like "1 hour, 30 minutes" (which will be covered by Intl.Duration).
 * For now, this function just returns the biggest/closest unit and the resulting number from an integer
 * of seconds. (3678 => { duration: 1, unit: 'hour'}) This is accompanied by manual translations in our message
 * catalogues of strings like "second", "seconds", "minute", "minutes", etc.
 */
const getDurationAndUnit = (seconds: number) => {
  let unit: Intl.RelativeTimeFormatUnit = "second";
  let duration = seconds;
  const abs = Math.abs(seconds);

  if (abs >= 60) {
    unit = "minute";
    duration = duration / 60;
    if (abs >= 60 * 60) {
      unit = "hour";
      duration = duration / 60;
      if (abs >= 60 * 60 * 24) {
        unit = "day";
        duration = duration / 24;
        if (abs >= 60 * 60 * 24 * 365) {
          unit = "year";
          duration = duration / 365;
        } else if (abs >= 60 * 60 * 24 * 30) {
          unit = "month";
          duration = duration / 30;
        } else if (abs >= 60 * 60 * 24 * 7) {
          unit = "week";
          duration = duration / 7;
        }
      }
    }
  }

  duration = Math.round(duration);

  return { duration, unit };
};

const getRelativeTimeFormatter = (options?: object) => {
  return new Intl.RelativeTimeFormat(
    "en-US",
    options || { style: "short", numeric: "always" }
  );
};
const getDateTimeFormatter = (options?: object) => {
  return new Intl.DateTimeFormat(
    "en-US",
    options || { dateStyle: "medium", timeStyle: "short" }
  );
};
const getNumberFormatter = (options?: object) => {
  return new Intl.NumberFormat(
    // currently we are using only english number formatting because other
    // languages can result in very different string length, which we need to deal with.
    // (en: 10.2k, de: 10.200)
    "en", // 'en-US',
    options || { notation: "standard" }
  );
};
/**
 * predefined formatters
 */

const defaultRelativeTimeFormatter = getRelativeTimeFormatter();
const longRelativeTimeFormatter = getRelativeTimeFormatter({
  style: "long",
  numeric: "always",
});
const defaultNumberFormatter = getNumberFormatter(
  // format with two decimal places
  { maximumFractionDigits: 2 }
);
const compactNumberFormatter = getNumberFormatter({
  notation: "compact",
  compactDisplay: "short",
});
const percentNumberFormatter = getNumberFormatter({
  style: "percent",
  maximumFractionDigits: 2,
});

/**
 * formatting functions
 */

const formatRelativeTime = (
  timestamp: number,
  formatter?: Intl.RelativeTimeFormat
) => {
  const relativeTo = new Date().getTime() / 1e3;

  const { duration, unit } = getDurationAndUnit((timestamp/1e3) - relativeTo);

  formatter = formatter || defaultRelativeTimeFormatter;

  return formatter.format(duration, unit);
};

// doesn't use Intl (yet), needs useI18n's t function, to translate the unit
const formatDuration = (seconds: number) => {
  const { duration, unit } = getDurationAndUnit(seconds);

  return ` ${duration} ${unit}${duration !== 1 ? "s" : ""} }`;
};

const formatNumber = (number: number, formatter?: Intl.NumberFormat) => {
  formatter = formatter || defaultNumberFormatter;

  return formatter.format(number);
};

const formatCompactNumber = (number: number) =>
  formatNumber(number, compactNumberFormatter);

const formatPercentNumber = (number: number) =>
  formatNumber(number, percentNumberFormatter);

const getRelativeProposalPeriod = (state: ProposalStatusEnum, startBlock: number, endBlock: number,currentBlock:number): any => {

  const now = new Date()
  const startDate = new Date(now.getTime() + ((startBlock - currentBlock) * 5000))
  const endDate = new Date(now.getTime() +( (endBlock - currentBlock) * 5000))

  if (
    endDate < now 
  ) {
    return `Ended ${formatRelativeTime(endDate.getTime(), longRelativeTimeFormatter)} `;
  }
  if (startDate < now && endDate > now) {
    return `Ends ${formatRelativeTime(endDate.getTime(), longRelativeTimeFormatter)}`;
  }
  return `Starts ${formatRelativeTime(startDate.getTime(), longRelativeTimeFormatter)}`;
};

const getPercentFractionDigits = (value: number) => {
  const absValue = Math.abs(value);

  if (absValue === 0) {
    return 0;
  }

  let leadingZeros = 0;
  let tempValue = absValue;
  while (tempValue < 1) {
    tempValue *= 10;
    leadingZeros++;
  }

  return Math.max(1, Math.min(leadingZeros, 8));
};
function formatDate(d: Date) {
  return getDateTimeFormatter().format(d || Date.now());
}


export {
  getRelativeTimeFormatter,
  getNumberFormatter,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatCompactNumber,
  formatPercentNumber,
  formatDate,
  getRelativeProposalPeriod,
  getPercentFractionDigits,
  longRelativeTimeFormatter,
};
