export interface CardContainerProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export function CardContainer({
  children,
  onClick,
  hoverable,
}: CardContainerProps) {
  function handleClick() {
    if (onClick) {
      onClick();
    }
  }
  return (
    <div
      onClick={handleClick}
      className={`border   border-snapBorder rounded-xl md:border mb-0 flex items-center justify-center text-center transition-all ${
        hoverable ? "hover:border-snapLink cursor-pointer" : ""
      }`}
    >
      {children}
    </div>
  );
}
