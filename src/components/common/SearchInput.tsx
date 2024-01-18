import React, { ChangeEvent, useRef } from "react";
export interface SearchInputProps {
  symbol: string;
  placeholder: string;
  value: string | undefined;
  onChange: (new_value: string) => void;
  type?: "number" | "text";
}
function SearchInput({ onChange, placeholder, value, type }: SearchInputProps) {
  const baseInputRef = useRef(null);

  //   useEffect(() => {
  //     if (focusOnMount) {
  //       baseInputRef.current.focus();
  //     }
  //   }, [focusOnMount]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    /** sanitize if needed */
    onChange(val);
  }

  const clearInput = () => {
    onChange("");
  };

  return (
    <div className="flex h-44 items-center ">
      {/*search icon */}
      <input
        ref={baseInputRef}
        value={value}
        placeholder={placeholder}
        type="text"
        autoCorrect="off"
        autoCapitalize="none"
        className="input w-full border-none"
        onChange={handleChange}
      />
      {/* replace with X svg for clear input icon*/}
    </div>
  );
}
