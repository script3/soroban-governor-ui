import { MouseEvent } from "react";
import Typography from "./Typography";

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
    !disabled && onClick(e);
  }
  return (
    <button
      className={`flex w-max  border border-snapBorder hover:border-snapLink p-4 rounded-full justify-center text-sm font-normal text-white  focus:outline-none focus-visible:ring-2 active:bg-neutral-800 ${
        disabled
          ? "bg-neutral-600 pointer-events-none  opacity-50"
          : "bg-transparent"
      } ${className || ""}
      `}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
``;
