export interface ProgressWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  percentage: number;
}

export function ProgressWrapper({
  children,
  className,
  percentage,
}: ProgressWrapperProps) {
  /** if greater than 1 then take as 100 based  */
  const width =
    percentage > 1
      ? percentage.toFixed(2)
      : (Number(percentage.toFixed(2)) * 100).toFixed(2);
  return (
    <div
      className={`flex relative min-h-[40px] w-full rounded-md bg-transparent items-center  ${
        className || ""
      }`}
    >
      <div
        className={`absolute flex  h-full rounded-md bg-snapBorder z-10 `}
        style={{ width: `${width}%` }}
      ></div>
      <div className="flex ml-3 items-center w-full p-2 leading-[43px] text-snapLink z-20 justify-center">
        {children}
      </div>
    </div>
  );
}
