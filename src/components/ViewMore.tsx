import { Button } from "./common/Button";

export interface ViewMoreProps {
  children: React.ReactNode;
  isFull?: boolean;
  onChange: (isFull: boolean) => void;
}
export function ViewMore({ children, isFull, onChange }: ViewMoreProps) {
  return (
    <div className="relative">
      {!isFull && (
        <div className="absolute bottom-0 h-[80px] w-full  bg-gradient-to-t from-bg "></div>
      )}

      <div
        className={`absolute flex w-full justify-center ${
          isFull ? "-bottom-[64px]" : "-bottom-[14px]"
        }`}
      >
        <Button
          className="!bg-bg px-6"
          onClick={() => {
            onChange(!isFull);
          }}
        >
          {isFull ? "View Less" : "View More"}
        </Button>
      </div>
      {children}
    </div>
  );
}
