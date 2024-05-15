import { MouseEvent } from "react";
import Typography from "./Typography";

export interface ButtonProps {
  onClick: (e: MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  padding?: string;
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
      className={`${
        disabled
          ? "bg-neutral-600 pointer-events-none  opacity-50"
          : "bg-transparent"
      } ${
        className || ""
      } flex w-max text-sm  border border-snapBorder hover:border-snapLink p-3 rounded-full justify-center font-normal   focus:outline-none focus-visible:ring-2 active:bg-neutral-800  
      `}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
``;
