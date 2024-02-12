export function Box({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={`border border-snapBorder rounded-xl px-4  ${className} `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
