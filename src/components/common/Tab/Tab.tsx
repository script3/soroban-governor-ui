export interface TabProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export function Tab({ children, className, active, onClick }: TabProps) {
  return (
    <a
      className={`${
        active ? "text-white my-0 " : "text-snapLink "
      } bg-transparent relative cursor-pointer border-box p-6 ${className}`}
      onClick={onClick}
    >
      {children}
      {!!active && (
        <div className=" absolute flex h-[4px] mt-2 w-[60%] left-[20%] self-center bg-snapLink rounded-t-md"></div>
      )}
    </a>
  );
}
