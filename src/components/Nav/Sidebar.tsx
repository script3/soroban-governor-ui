import Image from "next/image";
import sorobanLogo from "../../../public/sorobangov.svg";
export function SideBar() {
  return (
    <div className="flex flex-col  sticky top-0 z-50 sm:w-[60px] h-screen max-w-0 sm:max-w-none border border-snapBorder">
      <div className="flex w-full  h-[70px] justify-center items-center ">
        <Image src={sorobanLogo} width={50} height={50} alt="logo" />
      </div>
    </div>
  );
}
