import { TypographyProps } from ".";

export function Tiny({ className, children, onClick }: TypographyProps) {
  return (
    <span
      onClick={() => {
        onClick && onClick();
      }}
      className={`mb-0 mt-0 !h-[32px] text-tiny overflow-hidden pb-0 ${
        className || ""
      } `}
    >
      {children}
    </span>
  );
}
