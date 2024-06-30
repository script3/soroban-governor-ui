import React, { ChangeEvent, useRef } from "react";
import Typography from "./Typography";
import TypeSelectorDropdown from "./TypeSelectorDropDown";
import { Val } from "@script3/soroban-governor-sdk";
import { Container } from "./BaseContainer";
export interface TypedInputProps {
  symbol?: string;
  placeholder: string;
  value: Val;
  onChange: (new_value: Val) => void;
  className?: string;
  error?: boolean;
  errorMessage?: string;
}
export function TypedInput({
  onChange,
  placeholder,
  value,
  className,
  error = false,
  errorMessage,
}: TypedInputProps) {
  const baseInputRef = useRef(null);

  function handleValueChange(e: ChangeEvent<HTMLInputElement>) {
    const new_value = e.target.value;
    if (value.type.type === "i32" || value.type.type === "u32") {
      onChange({ value: Number(new_value), type: value.type });
    } else if (value.type.type === "boolean" && (new_value.toLowerCase() === "true" || new_value.toLowerCase() === "false")) {
      onChange({ value: new_value.toLowerCase() === "true", type: value.type });
    } else {
      onChange({ value: new_value, type: value.type});
    }
  }

  function handleTypeChange(type: string) {
    const new_type = { type: type };
    onChange({ value: value.value, type: new_type });
  }

  return (
    <Container
      slim={true}
      className={`flex h-[44px] gap-2 items-center flex-auto bg-transparent rounded-full border pl-4 pr-0 invalid:border-error focus-within:border-snapLink ${
        error
          ? "!border-error focus-within:!border-red-800"
          : "border-snapBorder focus-within:border-snapLink"
      }  ${className || ""}`}
    >
      <input
        ref={baseInputRef}
        value={value.value}
        placeholder={placeholder}
        autoCorrect="off"
        autoCapitalize="none"
        className="input w-full border-none bg-transparent focus:border-none outline-none z-10"
        onChange={handleValueChange}
      />
      <TypeSelectorDropdown
        value={value.type.type}
        onChange={handleTypeChange}
      />
      {!!errorMessage && (
        <Typography.Tiny className="text-red">{errorMessage}</Typography.Tiny>
      )}
    </Container>
  );
}
