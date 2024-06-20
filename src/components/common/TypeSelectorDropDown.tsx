import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { Container } from "./BaseContainer";
import Image from "next/image";

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
          {isOpen ? (
            <Image
              src="/icons/collapse.svg"
              width={22}
              height={22}
              alt={"close"}
            ></Image>
          ) : (
            <Image
              src="/icons/expand.svg"
              width={22}
              height={22}
              alt={"open"}
            ></Image>
          )}
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
