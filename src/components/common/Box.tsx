export function Box({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border border-snapBorder rounded-xl px-4  ${className} `}>
      {children}
    </div>
  );
}
