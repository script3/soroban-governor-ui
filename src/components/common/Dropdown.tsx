import { Menu } from "@headlessui/react";
import ChevronDown from "../../assets/icons/chevron-down.svg";
import Image from "next/image";
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
  placement: Placement;
  onSelect: (action: string) => void;
}
export function Dropdown({
  items,
  selected,
  placement,
  onSelect,
}: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex  w-max bg-transparent border border-snapBorder hover:border-snapLink py-3 px-6 rounded-full justify-center  text-sm font-medium text-white  focus:outline-none focus-visible:ring-2">
        More
        {/** @dev @TODO make this able to be import  */}
        <svg
          viewBox="0 0 24 24"
          width="1.2em"
          height="1.2em"
          className="-mr-1 ml-2 h-5 w-5"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m19 9l-7 7l-7-7"
          ></path>
        </svg>
      </Menu.Button>
      <Menu.Items
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.036) 2px 4px 9px 0px",
        }}
        className=" absolute border border-snapBorder  mt-2  origin-top-right  rounded-md w-full"
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
                  {item.text}
                </div>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
}
