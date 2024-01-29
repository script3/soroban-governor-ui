export function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.2em"
      height="1.2em"
      className={` stroke-snapLink ${className}`}
    >
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6l3 6h-8.5l-1-1H5a2 2 0 0 0-2 2Zm9-13.5V9"
      ></path>
    </svg>
  );
}
