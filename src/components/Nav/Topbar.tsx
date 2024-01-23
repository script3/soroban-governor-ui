import { ThreeDotsSVG } from "@/pages/comps";
import { Button } from "../common/Button";
import Typography from "../common/Typography";

export function TopBar() {
  return (
    <div className="flex w-full justify-between items-center sticky top-0 mb-4  z-50 p-4 border-b border-snapBorder bg-transparent">
      <Typography.Big>Soroban Governor</Typography.Big>
      <div className="flex items-center gap-2">
        <Button onClick={() => {}}>Connect Wallet</Button>
        <Button onClick={() => {}}>{ThreeDotsSVG}</Button>
      </div>
    </div>
  );
}
