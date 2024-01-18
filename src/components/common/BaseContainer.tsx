export interface ContainerProps {
  children: React.ReactNode;
  slim?: boolean;
  className?: string;
}

export function Container({ slim, children, className }: ContainerProps) {
  const containerClasses = slim ? "px-0 md:px-4" : "px-4";

  return (
    <div
      className={`mx-auto max-w-[1012px] ${containerClasses} ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}
