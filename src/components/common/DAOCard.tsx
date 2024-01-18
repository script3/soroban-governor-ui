import { MouseEvent } from "react";
import { Button } from "./Button";
import { CardContainer } from "./CardContainer";

export interface DAOCardProps {
  className?: string;
  hoverable?: boolean;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  onCardClick: () => void;
}
export function DAOCard({
  className,
  hoverable = true,
  title,
  description,
  buttonText,
  onButtonClick,
  onCardClick,
}: DAOCardProps) {
  function handleButtonClick(e: MouseEvent) {
    e.stopPropagation();
    onButtonClick();
  }
  return (
    <CardContainer hoverable={hoverable} onClick={onCardClick}>
      <div className="p-4 leading-5 sm:leading-6 flex w-full h-full flex-col gap-2 justify-center items-center">
        <span className="mb-0 mt-0 !h-[32px] overflow-hidden pb-0 font-bold ">
          {title}
        </span>
        <span className="mb-[12px] text-snapLink">{description}</span>
        <Button onClick={handleButtonClick}>{buttonText}</Button>
      </div>
    </CardContainer>
  );
}
