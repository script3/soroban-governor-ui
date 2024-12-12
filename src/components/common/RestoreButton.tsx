import { rpc } from "@stellar/stellar-sdk";
import { MouseEvent } from "react";
import { Button, ButtonProps } from "./Button";
import { Loader } from "./Loader";

export interface RestoreButtonProps extends ButtonProps {
  onRestore: (e: MouseEvent) => void;
  simResult: rpc.Api.SimulateTransactionResponse | undefined;
  isLoading: boolean;
}

export function RestoreButton({
  onClick,
  onRestore,
  children,
  isLoading,
  className,
  simResult,
  disabled = false,
  padding,
}: RestoreButtonProps) {
  if (simResult === undefined) {
    return (
      <Button
        onClick={onClick}
        className={className}
        disabled={disabled || isLoading}
        padding={padding}
      >
        {isLoading ? <Loader /> : children}
      </Button>
    );
  } else {
    return (
      <Button
        onClick={onRestore}
        className={`${className} !bg-transparent border-warning text-warning hover:border-white hover:text-white`}
        disabled={isLoading}
      >
        {isLoading ? <Loader /> : "Restore"}
      </Button>
    );
  }
}
