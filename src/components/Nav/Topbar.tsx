import { ThreeDotsSVG } from "@/pages/comps";
import { Button } from "../common/Button";
import Typography from "../common/Typography";
import { useRouter } from "next/navigation";

export function TopBar() {
  const router = useRouter();
  return (
    <div className="flex w-full justify-between items-center sticky top-0 mb-4  z-50 py-2 px-6 border-b border-snapBorder bg-bg">
      <Typography.Medium
        className="cursor-pointer"
        onClick={() => {
          router.replace("/");
        }}
      >
        Soroban Governor
      </Typography.Medium>
      <div className="flex items-center gap-2">
        <Button className="px-6" onClick={() => {}}>
          Connect Wallet
        </Button>
        <Button onClick={() => {}}>{ThreeDotsSVG}</Button>
      </div>
    </div>
  );
}
