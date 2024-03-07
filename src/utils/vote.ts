export function getSupportStringFromVote(voteSupport: number) {
  if (voteSupport === 2) {
    return "For";
  }
  if (voteSupport === 1) {
    return "Against";
  }
  if (voteSupport === 0) {
    return "Abstain";
  }
  return "Unknown";
}
