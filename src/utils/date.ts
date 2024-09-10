/**
 * Wrapper functions for Intl.RelativeTimeFormat/NumberFormat
 * returning computed properties based on current locale from i18n
 */

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

/**
 * predefined formatters
 */

const defaultRelativeTimeFormatter = getRelativeTimeFormatter();
const longRelativeTimeFormatter = getRelativeTimeFormatter({
  style: "long",
  numeric: "always",
});

/**
 * formatting functions
 */

const formatRelativeTime = (
  timestamp: number,
  formatter?: Intl.RelativeTimeFormat
) => {
  const relativeTo = new Date().getTime() / 1e3;

  const { duration, unit } = getDurationAndUnit(timestamp / 1e3 - relativeTo);

  formatter = formatter || defaultRelativeTimeFormatter;

  return formatter.format(duration, unit);
};

function getProposalDate(block: number, currentBlock: number) {
  const now = new Date();
  const d = new Date(now.getTime() + (block - currentBlock) * 5500);
  return d;
}

const getRelativeProposalPeriod = (
  startBlock: number,
  endBlock: number,
  currentBlock: number
): any => {
  const now = new Date();
  const startDate = new Date(
    now.getTime() + (startBlock - currentBlock) * 5000
  );
  const endDate = new Date(now.getTime() + (endBlock - currentBlock) * 5500);

  if (endDate < now) {
    return `Ended ${formatRelativeTime(
      endDate.getTime(),
      longRelativeTimeFormatter
    )} `;
  }
  if (startDate < now && endDate > now) {
    return `Ends ${formatRelativeTime(
      endDate.getTime(),
      longRelativeTimeFormatter
    )}`;
  }
  return `Starts ${formatRelativeTime(
    startDate.getTime(),
    longRelativeTimeFormatter
  )}`;
};

function formatDate(d: Date) {
  return getDateTimeFormatter().format(d || Date.now());
}

export { formatDate, getProposalDate, getRelativeProposalPeriod };
