import { TypographyProps } from ".";

export function Small({ className, children, onClick }: TypographyProps) {
  return (
    <span
      onClick={() => {
        onClick && onClick();
      }}
      className={`mb-0 mt-0  text-sm overflow-hidden pb-0 font-normal ${
        className || ""
      } `}
    >
      {children}
    </span>
  );
}
