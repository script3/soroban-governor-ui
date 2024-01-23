import { Menu } from "@headlessui/react";
import ChevronDown from "../../assets/icons/chevron-down.svg";
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
  selected: string;
  chevron?: boolean;
  buttonText: ReactNode;
  placement: Placement;
  onSelect: (action: string) => void;
}
export function Dropdown({
  items,
  buttonText,
  chevron = true,
  selected,
  placement,
  onSelect,
}: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center w-max bg-transparent border border-snapBorder hover:border-snapLink p-3 rounded-full justify-center  text-tiny font-medium text-white  focus:outline-none focus-visible:ring-2">
        {buttonText}
        {/** @dev @TODO make this able to be import  */}
        {chevron && (
          <svg
            viewBox="0 0 24 24"
            width="12px"
            height="12px"
            className="-mr-1 ml-2 h-5 w-5"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 9l-7 7l-7-7"
            ></path>
          </svg>
        )}
      </Menu.Button>
      <Menu.Items
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.036) 2px 4px 9px 0px",
        }}
        className=" absolute bg-bg border border-snapBorder  mt-2  min-w-max origin-top-right  rounded-md w-full z-50"
      >
        {" "}
        <div className="no-scrollbar max-h-[300px] overflow-auto">
          {items.map((item) => (
            <Menu.Item key={item.action}>
              {({ active }) => (
                <div
                  className={` ${
                    active ? "bg-neutral-700 text-white" : "text-snapLink"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm   font-bold cursor-pointer `}
                  onClick={() => onSelect(item.action)}
                >
                  <Typography.Small>{item.text}</Typography.Small>
                </div>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
}
