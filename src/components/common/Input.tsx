import React, { ChangeEvent, useRef } from "react";
export interface InputProps {
  symbol?: string;
  placeholder: string;
  value: string | undefined;
  onChange: (new_value: string) => void;
  type?: "number" | "text";
}
export function Input({ onChange, placeholder, value, type }: InputProps) {
  const baseInputRef = useRef(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    /** sanitize if needed */
    onChange(val);
  }

  const clearInput = () => {
    onChange("");
  };

  return (
    <div className="flex h-[44px] items-center flex-auto bg-transparent border-snapBorder rounded-full border pl-4 pr-0 focus-within:border-snapLink">
      <input
        ref={baseInputRef}
        value={value}
        placeholder={placeholder}
        type="text"
        autoCorrect="off"
        autoCapitalize="none"
        className="input w-full border-none bg-transparent focus:border-none outline-none"
        onChange={handleChange}
      />
    </div>
  );
}
