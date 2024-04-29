export interface ContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  slim?: boolean;
  className?: string;
}

export function Container({
  slim,
  children,
  className,
  style,
}: ContainerProps) {
  const containerClasses = slim ? "px-0" : "px-4";

  return (
    <div
      style={style || {}}
      className={` ${containerClasses} ${className || ""}`}
    >
      {children}
    </div>
  );
}
