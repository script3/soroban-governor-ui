import { Switch } from "@headlessui/react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
/**
 * @param value - the current value of the toggle
 * @param onChange - the function to call when the toggle is changed
 * @param disabled - whether the toggle is disabled
 * @param color - the color of the toggle when enabled following tailwind color scheme
 */
export interface ToggleProps {
  value: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  bgColorClass?: string;
  iconColorClass?: string;
}
function toggle({
  value,
  onChange,
  disabled = false,
  bgColorClass,
  iconColorClass,
}: ToggleProps) {
  function handleChange() {
    !disabled && onChange(!value);
  }

  return (
    <div className="">
      <Switch disabled={disabled} checked={value} onChange={handleChange}>
        {({ checked }) => (
          /* Use the `checked` state to conditionally style the button. */
          <div
            className={`${
              checked ? ` ${bgColorClass || "bg-green-500"}` : "bg-snapBorder"
            } relative inline-flex h-6 w-11 items-center rounded-full ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } transition-colors`}
          >
            <span className="sr-only">Enable</span>
            <span
              className={`${
                checked
                  ? `translate-x-6  ${iconColorClass || "text-green-500"}`
                  : "translate-x-1 text-neutral-500 "
              }  h-4 w-4 transform rounded-full bg-bg transition text-[10px] flex justify-center items-center`}
            >
              {checked ? (
                <svg
                  width={10}
                  height={10}
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"></path>
                </svg>
              ) : (
                <svg width={10} height={10} fill="none" viewBox="0 0 12 12">
                  <path
                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              )}
            </span>
          </div>
        )}
      </Switch>
    </div>
  );
}
/** @dev this component does not support SSR so it needs to be rendered in client only mode  */
export const Toggle = dynamic(() => Promise.resolve(toggle), {
  ssr: false,
});
