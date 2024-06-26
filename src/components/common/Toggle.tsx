import React, { useState } from "react";
import { Container } from "./BaseContainer";
import { Button } from "./Button";
export interface ToggleProps {
  value: string | undefined;
  options: string[];
  onChange: (new_value: string) => void;
  className?: string;
}
export function ToggleComponent({
  className,
  value,
  options,
  onChange,
}: ToggleProps) {
  return (
    <Container className={`flex ${className || " py-2"}`} slim={true}>
      <Button
        className={`${
          value === options[0]
            ? "bg-white text-black"
            : "bg-neutral-800 text-white"
        }  py-2 px-4`}
        onClick={() => onChange(options[0])}
      >
        {options[0]}
      </Button>
      <Button
        className={`${
          value === options[1]
            ? "bg-white text-black"
            : "bg-neutral-800 text-white"
        } py-2 px-4`}
        onClick={() => onChange(options[1])}
      >
        {options[1]}
      </Button>
    </Container>
  );
}

export default ToggleComponent;
