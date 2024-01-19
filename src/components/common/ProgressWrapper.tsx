export interface ProgressWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  percentage?: number;
}

export function ProgressWrapper({
  children,
  className,
  percentage,
}: ProgressWrapperProps) {
  return (
    <div
      className={`flex relative min-h-[40px] w-full rounded-md bg-transparent items-center  ${
        className || ""
      }`}
    >
      <div className="absolute flex  w-[80%] h-full rounded-md bg-snapBorder z-10 "></div>
      <div className="flex ml-3 items-center w-full p-2 leading-[43px] text-snapLink z-20 justify-center">
        {children}
      </div>
    </div>
  );
}
