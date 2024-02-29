import Image from "next/image";
import { Container } from "./BaseContainer";
import { Button } from "./Button";
import Typography from "./Typography";

export type SelectableListProps = {
  onSelect: (value: any) => void;
  items: { value: any; label: string }[];
  selected: any;
};

export function SelectableList({
  onSelect,
  selected,
  items,
}: SelectableListProps) {
  return (
    <Container slim className="flex flex-col w-full gap-3">
      {items.map(({ value, label }, ind) => (
        <div
          key={label + ind}
          onClick={() => {
            onSelect(value);
          }}
          className={`flex flex-row justify-between rounded-full border ${
            selected === value ? "border-white" : "border-snapBorder"
          } background-snapBg p-4 w-full cursor-pointer`}
        >
          <Container slim className="ml-4">
            <Typography.P>{label}</Typography.P>
          </Container>
          <Container slim>
            {selected === value ? (
              <Image
                src="/icons/check.svg"
                width={22}
                height={22}
                alt="selected"
              />
            ) : (
              ""
            )}
          </Container>
        </div>
      ))}
    </Container>
  );
}
