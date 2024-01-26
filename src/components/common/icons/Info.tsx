export function Info({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.2em"
      height="1.2em"
      className={`${className || ""}`}
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
      ></path>
    </svg>
  );
}
