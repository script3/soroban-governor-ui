import Image from "next/image";
import sorobanLogo from "../../../public/sorobangov.svg";
export function SideBar() {
  return (
    <div className="flex-col sticky top-0 w-[60px] max-w-[60px] z-50 hidden md:flex h-screen border border-snapBorder">
      <div className="flex w-full  h-[70px] justify-center items-center ">
        <Image src={sorobanLogo} width={50} height={50} alt="logo" />
      </div>
    </div>
  );
}
