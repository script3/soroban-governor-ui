import { TypographyProps } from ".";

export function P({ className, children, onClick }: TypographyProps) {
  return (
    <span
      onClick={() => {
        onClick && onClick();
      }}
      className={`mb-0 mt-0 !h-[32px] text-base overflow-hidden pb-0 font-400 ${
        className || ""
      } `}
    >
      {children}
    </span>
  );
}
