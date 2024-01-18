import { MouseEvent } from "react";

export interface ButtonProps {
  onClick: (e: MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Button({
  onClick,
  children,
  className,
  disabled = false,
}: ButtonProps) {
  function handleClick(e: MouseEvent) {
    onClick(e);
  }
  return (
    <button
      className={`${className || ""}
      flex  w-max bg-transparent border border-snapBorder hover:border-snapLink py-3 px-6 rounded-full justify-center  text-sm font-medium text-white  focus:outline-none focus-visible:ring-2 active:bg-neutral-800
      ${disabled ? "bg-neutral-600 pointer-events-none opacity-50" : ""}
      `}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
``;
