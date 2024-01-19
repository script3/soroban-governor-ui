import { TypographyProps } from ".";

export function Medium({ className, children, onClick }: TypographyProps) {
  return (
    <span
      onClick={() => {
        onClick && onClick();
      }}
      className={`mb-0 mt-0 !h-[32px] text-med overflow-hidden pb-0 ${
        className || ""
      } `}
    >
      {children}
    </span>
  );
}
