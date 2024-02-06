import { formatCompactNumber } from "@/utils/date";
import { Container } from "./common/BaseContainer";
import Typography from "./common/Typography";
import { shortenAddress } from "@/utils/shortenAddress";
import { EighteenDecimals } from "@/constants";

export function VoteListItem({
  vote,
  proposal,
  index,
}: {
  vote: any;
  proposal: any;
  index: number;
}) {
  return (
    <Container
      key={index}
      className={`flex items-center gap-3 justify-between border-snapBorder px-4 py-[14px]  ${
        index === proposal.votes.length - 1 ? "border-b-0 border-t" : "border-t"
      }`}
    >
      <Typography.P className="w-[110px] min-w-[110px] xs:w-[130px] xs:min-w-[130px]">
        {shortenAddress(vote.address)}
      </Typography.P>
      <Typography.P className=" truncate px-2 text-center ">
        {vote.choice}
      </Typography.P>
      <Typography.P className="flex w-[110px] min-w-[110px] items-center justify-end whitespace-nowrap text-right  xs:w-[130px] xs:min-w-[130px]">
        {formatCompactNumber(Number(vote.balance / BigInt(EighteenDecimals)))}
      </Typography.P>
    </Container>
  );
}
