export interface ViewMoreProps {
  children: React.ReactNode;
  isFull?: boolean;
  onChange?: (isFull: boolean) => void;
}
export function ViewMore({ children, isFull, onChange }: ViewMoreProps) {
  return (
    <div className="relative  ">
      {!isFull && (
        <div className="absolute bottom-0 h-[80px] w-full bg-gradient-to-t from-skin-bg"></div>
      )}

      {children}
    </div>
  );
}
/**
 * background-image: linear-gradient(to top, rgb(28, 27, 32), rgba(255, 255, 255, 0))
 * */
