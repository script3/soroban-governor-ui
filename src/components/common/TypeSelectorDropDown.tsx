import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { Container } from "./BaseContainer";

export interface TypeProps {
  value: string | undefined;
  onChange: (new_value: string) => void;
  type?: "number" | "text" | "url" | "email" | "password";
}

export function TypeSelectorDropdown({ value, onChange }: TypeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    "address",
    "bool",
    "bytes",
    "i32",
    "i64",
    "i128",
    "i256",
    "map",
    "string",
    "symbol",
    "u32",
    "u64",
    "u128",
    "u256",
    "vec",
  ];

  const ref = React.useRef<HTMLDivElement>(null);

  // Close the menu if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  return (
    <div ref={ref}>
      <Container slim={true} className="relative inline-block text-left">
        <Button
          className="border-transparent h-[44px] "
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value == undefined || value == "" ? "Type" : value}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>

        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              {types.map((type, index) => (
                <a
                  key={index}
                  href="#"
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={(event) => {
                    event.preventDefault();
                    onChange(type);
                    setIsOpen(false);
                  }}
                >
                  {type}
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default TypeSelectorDropdown;
