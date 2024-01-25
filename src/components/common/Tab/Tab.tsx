export interface TabProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  position?: tabDecoPositions;
}

export type tabDecoPositions = "left" | "bottom" | "right" | "top";

const classByPosition: { [key in tabDecoPositions]: string } = {
  bottom: "bottom-0 h-[4px] w-[60%] left-[20%] self-center mt-1 rounded-t-md",
  left: " left-0 top-0 w-[4px] h-[60%] top-[20%] self-center mr-1 rounded-r-md",
  right: "right-0 w-[4px] h-[60%] top-[20%] self-center ml-1 rounded-l-md",
  top: " top-0 h-[4px] w-[60%] left-[20%] self-center mb-1 rounded-b-md",
};

export function Tab({
  children,
  className,
  active,
  onClick,
  position = "bottom",
}: TabProps) {
  return (
    <a
      className={`${
        active ? "text-white my-0 " : "text-snapLink "
      } bg-transparent relative cursor-pointer border-box p-3 ${className}`}
      onClick={onClick}
    >
      {children}
      {!!active && (
        <div
          className={` absolute  flex  bg-snapLink  ${classByPosition[position]}`}
        ></div>
      )}
    </a>
  );
}
