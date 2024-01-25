import { MouseEvent } from "react";
import { Button } from "./Button";
import { CardContainer } from "./CardContainer";
import Typography from "./Typography";
import Image from "next/image";

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
    <CardContainer
      className={className}
      hoverable={hoverable}
      onClick={onCardClick}
    >
      <div className="p-4  leading-5 sm:leading-6 flex w-full h-full flex-col gap-4 justify-center items-center">
        <img
          className="rounded-full object-cover"
          src="https://cdn.stamp.fyi/space/stgdao.eth?s=164&cb=7faee6797e3d57e7"
          alt="project image"
          width={82}
          height={82}
        />
        <div className="flex flex-col justify-center items-center p-2 ">
          <Typography.P className="mb-0 mt-0  pb-0 font-bold truncate ">
            {title}
          </Typography.P>
          <Typography.Small className="mb-[12px] text-snapLink">
            {description}
          </Typography.Small>
          <Button className="px-10" onClick={handleButtonClick}>
            {buttonText}
          </Button>
        </div>
      </div>
    </CardContainer>
  );
}
