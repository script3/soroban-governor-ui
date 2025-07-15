import { VoteSupport } from "@/types";
import { GovernorSettings, VoteCount } from "@script3/soroban-governor-sdk";

export function getSupportStringFromVote(voteSupport: VoteSupport) {
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

export function parseQuorumInfo(
  voteSupply: bigint | undefined,
  governorSettings: GovernorSettings | undefined,
  vote_count: VoteCount | undefined,
): {
  quorumPercentage: number;
  quorumRequirement: bigint;
  quorumVotes: bigint;
} {
  if (!voteSupply || !governorSettings || !vote_count) {
    return {
      quorumPercentage: 0,
      quorumRequirement: BigInt(0),
      quorumVotes: BigInt(0),
    };
  }

  // quorum is expressed in basis points (1/10000)
  // do math as float and round up to nearest integer
  const quorumRequirement = BigInt(Math.ceil(Number(voteSupply) * (governorSettings.quorum / 10000)));
  let quorumVotes = BigInt(0);
  if (governorSettings.counting_type & 0b100) {
    quorumVotes += vote_count.against;
  }
  if (governorSettings.counting_type & 0b010) {
    quorumVotes += vote_count._for;
  }
  if (governorSettings.counting_type & 0b001) {
    quorumVotes += vote_count.abstain;
  }

  const quorumPercentage = Number(quorumVotes) / Number(quorumRequirement);

  return {
    quorumPercentage,
    quorumRequirement,
    quorumVotes,
  };
}
