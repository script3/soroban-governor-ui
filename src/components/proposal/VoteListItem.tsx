import { Container } from "../common/BaseContainer";
import Typography from "../common/Typography";
import { shortenAddress } from "@/utils/shortenAddress";
import { getSupportStringFromVote } from "@/utils/vote";
import { Chip } from "../common/Chip";
import { Vote, VoteSupport } from "@/types";
import { toBalance } from "@/utils/formatNumber";

export function VoteListItem({
  vote,
  voteCount,
  index,
  decimals,
}: {
  vote: Vote;
  voteCount: bigint;
  index: number;
  decimals: number;
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
      className={`flex relative items-center gap-3 justify-between box-border border-snapBorder px-4 py-[14px]`}
    >
      <Typography.P className="w-max min-w-[110px] xs:w-[130px] xs:min-w-[130px]">
        {shortenAddress(vote.voter)}
      </Typography.P>
      <Container slim className="flex w-full justify-center absolute inset-x-0">
        <Chip
          className={` truncate px-2 text-center  ${getColorClassByVote(
            vote.support
          )} `}
        >
          {getSupportStringFromVote(vote.support)}
        </Chip>
      </Container>
      <Typography.P className="flex w-max min-w-[200px] items-center justify-end whitespace-nowrap text-right  xs:w-[130px] xs:min-w-[130px]">
        {toBalance(vote.amount, decimals)}
      </Typography.P>
    </Container>
  );
}
