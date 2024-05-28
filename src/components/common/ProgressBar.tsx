import { ReactNode } from "react";
import Typography from "./Typography";

/**
 * @name ProgressBar
 * @description
 * @param {string} [className=""] - className
 * @param {number} percentage - progress as a percentage in decimal form
 * @param {string} [barClassName=""] - barClassName -  pass any classes you wish applied to the colored portion of the progress bar
 * @param {string} [label=""] - label
 * @param {ReactNode} [endContent=""] - endContent
 * @returns
 */
export interface ProgressBarProps {
  className?: string;
  percentage: number;
  barClassName?: string;
  label?: string;
  endContent?: ReactNode;
}
export function ProgressBar({
  className,
  percentage,
  barClassName,
  label,
  endContent,
}: ProgressBarProps) {
  const width =
    (Math.min(percentage * 100, 100)).toFixed(2);
  const fullWidth = percentage >= 1;
  return (
    <div
      className={`flex flex-col justify-center items-center w-full ${className}`}
    >
      {(!!label || !!endContent) && (
        <div className="flex w-full justify-between items-center">
          <Typography.P>{label}</Typography.P>
          {endContent}
        </div>
      )}
      <div className="flex w-full bg-snapBorder h-[8px] rounded-md">
        <div
          style={{ width: `${width}%`, height: "100%" }}
          className={`h-full rounded-l-md ${fullWidth ? "rounded-r-md" : ""}  ${
            barClassName || "bg-blue-700"
          }`}
        ></div>
      </div>
    </div>
  );
}
