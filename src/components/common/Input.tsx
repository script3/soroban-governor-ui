import React, { ChangeEvent, useRef } from "react";
export interface InputProps {
  symbol?: string;
  placeholder: string;
  value: string | undefined;
  onChange: (new_value: string) => void;
  type?: "number" | "text" | "url" | "email" | "password";
  className?: string;
  icon?: React.ReactNode;
}
export function Input({
  onChange,
  placeholder,
  value,
  type,
  className,
  icon,
}: InputProps) {
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
    <div
      className={`flex h-[44px] gap-2 items-center flex-auto bg-transparent border-snapBorder rounded-full border pl-4 pr-0 focus-within:border-snapLink ${
        className || ""
      }`}
    >
      {!!icon && icon}
      <input
        ref={baseInputRef}
        value={value}
        placeholder={placeholder}
        type={type || "text"}
        autoCorrect="off"
        autoCapitalize="none"
        className="input w-full border-none bg-transparent focus:border-none outline-none"
        onChange={handleChange}
      />
    </div>
  );
}
