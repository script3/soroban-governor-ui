import { ChangeEvent, ReactNode } from "react";
import { Container } from "./BaseContainer";
import { Chip } from "./Chip";
import Typography from "./Typography";

export interface RadioButtonProps {
    selected: boolean;
    onChange: () => void;
    label: ReactNode;
    className?: string;
    endText?: string;
}

export function RadioButton({
    selected,
    onChange,
    label,
    className,
    endText,
}: RadioButtonProps){


    function handleChange(e:ChangeEvent<HTMLInputElement>){
        console.log({e})
        onChange()
    }

    return <Container slim className="flex flex-row items-center">

    <label className="flex flex-row gap-2  p-4 items-center cursor-pointer" >
    <input
    className="h-5 w-5  appearance-none rounded-full border-2 checked:border-snapLink checked:border-[5px] cursor-pointer border-white bg-white   checked:bg-white  focus:bg-white focus:outline-1 focus:outline focus:outline-white "
    type="radio"
    checked={selected}
    onChange={handleChange}
   />
        <Container slim>
            {label}
            </Container>
    </label>
            <Typography.Small className="text-snapLink ">
                {endText}
            </Typography.Small >
    </Container>


        
}