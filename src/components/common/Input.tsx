import React, { ChangeEvent, useRef } from "react";
import Typography from "./Typography";

export interface InputProps {
  symbol?: string;
  placeholder: string;
  value: string | undefined;
  onChange: (new_value: string) => void;
  type?: "number" | "text" | "url" | "email" | "password";
  className?: string;
  icon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  max?: string;
  isDisabled?: boolean;
}

export function Input({
  onChange,
  placeholder,
  value,
  type,
  className,
  icon,
  error = false,
  errorMessage,
  max,
  isDisabled = false,
}: InputProps) {
  const baseInputRef = useRef(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    if (type === "number" && val !== "") {
      const sanitizedValue = val.replace(/[^0-9.\.]/gi, "");

      onChange(sanitizedValue);
    } else {
      onChange(val);
    }
  }

  function handleMax() {
    if (max && type === "number" && isFinite(Number(max))) {
      onChange(max);
    }
  }

  const clearInput = () => {
    onChange("");
  };

  return (
    <div
      className={`flex h-[44px] gap-2 items-center flex-auto bg-transparent rounded-full border pl-4 pr-0 invalid:border-error focus-within:border-snapLink ${
        error
          ? "!border-error focus-within:!border-red-800"
          : "border-snapBorder focus-within:border-snapLink"
      }  ${className || ""}`}
    >
      {!!icon && icon}
      <input
        ref={baseInputRef}
        value={value}
        placeholder={placeholder}
        autoCorrect="off"
        autoCapitalize="none"
        className={`input w-full border-none bg-transparent focus:border-none outline-none ${
          isDisabled ? "text-gray-400" : ""
        }`}
        onChange={handleChange}
        disabled={isDisabled}
      />
      {!!max && (
        <button
          onClick={handleMax}
          className="text-snapLink p-2 m-2 hover:text-white"
        >
          MAX
        </button>
      )}
      {!!errorMessage && error && (
        <Typography.Tiny className="text-red-500 pr-2">
          {errorMessage}
        </Typography.Tiny>
      )}
    </div>
  );
}
