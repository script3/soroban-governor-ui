import { formatCompactNumber } from "@/utils/date";
import { Container } from "./common/BaseContainer";
import Typography from "./common/Typography";
import { shortenAddress } from "@/utils/shortenAddress";
import { EighteenDecimals, SevenDecimals } from "@/constants";
import { getSupportStringFromVote } from "@/utils/vote";
import { Chip } from "./common/Chip";
import { VoteSupport } from "@/types";

export function VoteListItem({
  vote,
  voteCount,
  index,
}: {
  vote: any;
  voteCount: any;
  index: number;
}) {

  function getColorClassByVote(voteSupport: number) {
    if (voteSupport === VoteSupport.For) {
      return "!bg-success";
    }
    if (voteSupport === VoteSupport.Against) {
      return "!bg-primary";
    }
    if (voteSupport === VoteSupport.Abstain) {
      return "!bg-snapLink";
    }
    return "!bg-secondary";
  }

  return (
    <Container
      key={index}
      className={`flex items-center gap-3 justify-between border-snapBorder px-4 py-[14px]  ${
        index === voteCount - 1 ? "border-b-0 border-t" : "border-t"
      }`}
    >
      <Typography.P className="w-[110px] min-w-[110px] xs:w-[130px] xs:min-w-[130px]">
        {shortenAddress(vote.voter)}
      </Typography.P>
      <Chip className={` truncate px-2 text-center  ${getColorClassByVote(vote.support)} `}>
        {getSupportStringFromVote(vote.support)}
      </Chip>
      <Typography.P className="flex w-[110px] min-w-[110px] items-center justify-end whitespace-nowrap text-right  xs:w-[130px] xs:min-w-[130px]">
        {formatCompactNumber(Number(vote.amount) / SevenDecimals)}
      </Typography.P>
    </Container>
  );
}
