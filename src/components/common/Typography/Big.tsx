import { TypographyProps } from ".";

export function Big({ className, children, onClick }: TypographyProps) {
  return (
    <span
      onClick={() => {
        onClick && onClick();
      }}
      className={`mb-0 mt-0  text-lg overflow-hidden pb-0 ${className || ""} `}
    >
      {children}
    </span>
  );
}
