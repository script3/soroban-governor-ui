import { Menu } from "@headlessui/react";
import Image from "next/image";
import Typography from "./Typography";
import { ReactNode } from "react";

export type Alignment = "start" | "end";
export type Side = "top" | "right" | "bottom" | "left";
export type AlignedPlacement = `${Side}-${Alignment}`;
export type Placement = Side | AlignedPlacement;
export interface Item {
  text: string;
  action: string;
  extras?: any;
}
export interface DropdownProps {
  items: Item[];
  selected?: string;
  chevron?: boolean;
  buttonText: ReactNode;
  placement?: Placement;
  noBorder?: boolean;
  onSelect: (action: string) => void;
}
export function Dropdown({
  items,
  buttonText,
  chevron = true,
  noBorder = false,
  selected,
  placement,
  onSelect,
}: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className={`inline-flex items-center w-max bg-transparent ${
          noBorder
            ? "hover:opacity-50"
            : "border border-snapBorder hover:border-snapLink "
        } p-2 rounded-full justify-center  text-tiny font-medium text-white  focus:outline-none focus-visible:ring-2`}
      >
        {buttonText}
        {/** @dev @TODO make this able to be import  */}
        {chevron && (
          <Image
            alt="arrowdown"
            src="/icons/chevron-down.svg"
            className="ml-1"
            width={16}
            height={16}
          />
        )}
      </Menu.Button>
      <Menu.Items
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.036) 2px 4px 9px 0px",
        }}
        className=" absolute bg-bg border border-snapBorder right-0 origin-top-right min-w-max  rounded-2xl w-full z-50"
      >
        {" "}
        <div className="no-scrollbar max-h-[300px] overflow-auto">
          {items.map((item, index) => (
            <Menu.Item key={item.action}>
              {({ active }) => (
                <div
                  className={` ${
                    active ? "bg-neutral-700 text-white" : "text-snapLink"
                  } group flex w-full items-center ${
                    index === 0
                      ? "rounded-t-2xl"
                      : index === items.length - 1
                      ? "rounded-b-2xl"
                      : "rounded-none"
                  } px-3 py-2 text-sm !text-snapLink  hover:bg-neutral-700 hover:!text-white font-bold cursor-pointer whitespace-nowrap `}
                  onClick={() => onSelect(item.action)}
                >
                  <Typography.Small className="text-inherit">
                    {item.text}
                  </Typography.Small>
                </div>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
}
