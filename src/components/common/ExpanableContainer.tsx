import React, { useState } from "react";
import { Container } from "./BaseContainer";
import Image from "next/image";

const ExpandableComponent = ({
  key,
  name,
  children,
}: {
  key: number;
  name: string;
  children: React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Container className="border border-snapBorder rounded-xl px-4 p-4 box-border items-center">
      <Container className="flex flex-row gap-3 items-center justify-between">
        <code
          className={`whitespace-pre-wrap word-break p-1 ${
            isExpanded ? "text-transparent" : ""
          }`}
        >
          {name}
        </code>

        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <Image
              src="/icons/collapse.svg"
              width={28}
              height={28}
              alt={"close"}
            ></Image>
          ) : (
            <Image
              src="/icons/expand.svg"
              width={28}
              height={28}
              alt={"open"}
            ></Image>
          )}
        </button>
      </Container>
      {isExpanded && <div>{children}</div>}
    </Container>
  );
};

export default ExpandableComponent;
