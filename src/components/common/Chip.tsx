export interface ChipProps {
  children: React.ReactNode;
  className?: string;
}

export function Chip({ children, className }: ChipProps) {
  return (
    <div
      className={`text-white bg-green-500 min-w-[70px] rounded-full px-[12px] justify-center items-center flex text-tiny h-[24px] w-fit leading-[23px] ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}
