import { formatNumber } from "@/utils/formatNumber";

export interface CounterProps {
  counter: number | string | undefined;
}
export function BaseCounter({ counter }: CounterProps) {
  return (counter && Number(counter) >= 0) || typeof counter === "string" ? (
    <div className="h-[20px] min-w-[20px] rounded-full bg-skin-text px-1 text-center text-xs leading-normal text-white">
      {formatNumber(Number(counter))}
    </div>
  ) : null;
}
