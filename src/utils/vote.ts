import { VoteSupport } from "@/types";

export function getSupportStringFromVote(voteSupport: number) {
  if (voteSupport === VoteSupport.For) {
    return "For";
  }
  if (voteSupport === VoteSupport.Against) {
    return "Against";
  }
  if (voteSupport === VoteSupport.Abstain) {
    return "Abstain";
  }
  return "Unknown";
}
