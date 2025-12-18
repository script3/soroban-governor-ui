import { Button } from "../common/Button";
import Typography from "../common/Typography";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/wallet";
import { shortenAddress } from "@/utils/shortenAddress";
import Image from "next/image";
import { Dropdown, Item } from "../common/Dropdown";
const options: Item[] = [
  {
    text: "Disconnect",
    action: "disconnect",
  },
];
export function TopBar() {
  const router = useRouter();
  const { connect, connected, walletAddress, disconnect } = useWallet();

  return (
    <div className="flex w-full max-w-full justify-between items-center sticky top-0 mb-4  z-50 py-2 px-6 border-b border-snapBorder bg-bg">
      <Typography.Medium
        className="cursor-pointer"
        onClick={() => {
          router.replace("/");
        }}
      >
        Soroban Governor
      </Typography.Medium>
      <div className="flex items-center gap-2">
        <Button
          className="!p-2"
          onClick={() => {
            window.open(
              "https://github.com/script3/soroban-governor",
              "_blank"
            );
          }}
        >
          <Image
            src="/icons/github-mark-white.svg"
            width={27}
            height={27}
            alt="github"
            style={{ opacity: 0.5 }}
          />
        </Button>
        <Button
          className="px-6"
          onClick={() => {
            connect();
          }}
          disabled={!!walletAddress}
        >
          {walletAddress ? shortenAddress(walletAddress) : "Connect Wallet"}
        </Button>
        {connected && (
          <Button
            onClick={() => {
              disconnect();
            }}
          >
            <Image
              src="/icons/logout.svg"
              width={20}
              height={20}
              alt="threedots"
            />
          </Button>
        )}
      </div>
    </div>
  );
}
