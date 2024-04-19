import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { ProgressWrapper } from "@/components/common/ProgressWrapper";
import Typography from "@/components/common/Typography";
import {
  ProposalStatusText,
  classByProposalAction,
  classByStatus,
} from "@/constants";

import { getRelativeProposalPeriod } from "@/utils/date";
import { shortenAddress } from "@/utils/shortenAddress";
import { useState } from "react";

import {
  useCurrentBlockNumber,
  useDelegate,
  useGovernor,
  useProposals,
  useVoteTokenBalance,
} from "@/hooks/api";
import { toBalance } from "@/utils/formatNumber";
import { useRouter } from "next/router";
import { stripMarkdown } from "@/utils/string";
import { getStatusByProposalState } from "@/utils/proposal";
import { useWallet } from "@/hooks/wallet";

function Proposals() {
  const [searchValue, setSearchValue] = useState<string>("");

  const router = useRouter();
  const { blockNumber: currentBlockNumber } = useCurrentBlockNumber();

  const params = router.query;
  const { connected, walletAddress } = useWallet();
  const { governor } = useGovernor(params.dao as string, {
    placeholderData: {},
  });
  const { delegateAddress, refetch: refetchDelegate } = useDelegate(
    governor?.voteTokenAddress,
    {
      enabled: connected && !!governor?.voteTokenAddress,
    }
  );
  const hasDelegate = delegateAddress !== walletAddress;
  const { balance, refetch: refetchBalance } = useVoteTokenBalance(
    governor?.voteTokenAddress,
    {
      placeholderData: BigInt(0),
      enabled: connected && !!governor?.voteTokenAddress,
    }
  );

  const { proposals } = useProposals(
    governor?.address,
    governor?.settings?.vote_delay,
    governor?.settings?.vote_period,
    {
      placeholderData: [],
      enabled:
        !!params.dao &&
        !!governor?.address &&
        !!governor?.settings?.vote_delay &&
        !!governor?.settings?.vote_period,
    }
  );

  return (
    <Container slim className="flex flex-col gap-4">
      <Container className="flex justify-between items-center  flex-wrap py-6 gap-3">
        <Typography.Huge className="hidden lg:block text-white w-full mb-4">
          Proposals
        </Typography.Huge>
        <div className="flex w-full  md:w-60">
          <Input
            value={searchValue}
            placeholder="Search proposals"
            onChange={setSearchValue}
          />
        </div>

        <Button
          onClick={() => {
            router.push(`/${params.dao}/propose`, undefined, {
              scroll: false,
            });
          }}
          className="px-6 !w-full  md:!w-40 active:!opacity-90  "
        >
          New proposal
        </Button>
      </Container>
      {connected && (
        <Container>
          <Box className="flex  flex-row justify-between !px-0">
            <Container className="flex flex-col p-3 gap-2 border-b border-snapBorder w-full">
              <Typography.Tiny className="text-snapLink">
                Current Voting power
              </Typography.Tiny>
              <Container slim className="flex gap-2">
                <Typography.P>
                  {toBalance(balance, governor?.decimals)}{" "}
                  {governor?.voteTokenMetadata?.symbol}
                </Typography.P>
                {hasDelegate && (
                  <Chip className="!bg-transparent border border-secondary text-secondary">
                    Delegated
                  </Chip>
                )}
              </Container>
            </Container>
            {!!governor.isWrappedAsset && (
              <Container slim className=" flex flex-row  gap-3 px-6 py-4">
                <Button
                  onClick={() => {
                    router.push(`/${params.dao}/manage`);
                  }}
                  className="bg-white text-snapBorder active:opacity-50"
                >
                  Your votes
                </Button>
              </Container>
            )}
          </Box>
        </Container>
      )}
      {/* proposals  */}
      <Container className="flex flex-col gap-4">
        {proposals.map((proposal, ind) => {
          const proposalStatus = getStatusByProposalState(
            proposal.status,
            proposal.vote_start,
            proposal.vote_end,
            currentBlockNumber
          );
          return (
            <Box
              key={`${proposal.id} ${ind}`}
              className="p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <Typography.Small className="font-bold">
                  {shortenAddress(proposal.proposer)}
                </Typography.Small>
                <Container slim className="flex  gap-2 ">
                  <Chip className={`${classByStatus[proposalStatus]} mb-4`}>
                    {ProposalStatusText[proposalStatus]}
                  </Chip>
                  <Chip
                    className={`${
                      classByProposalAction[proposal.action.tag]
                    } mb-4`}
                  >
                    {proposal.action.tag}
                  </Chip>
                </Container>
              </div>
              <div
                className="flex flex-col gap-3 cursor-pointer"
                onClick={() => {
                  router.push(`/${params.dao}/proposal?id=${proposal.id}`);
                }}
              >
                <Typography.Medium className="font-semibold">
                  {proposal.title}
                </Typography.Medium>
                <Typography.P className="line-clamp-2 break-words text-md ">
                  {stripMarkdown(proposal.description)}
                </Typography.P>
                <div className="flex flex-col gap-2">
                  {/* votes progress bar */}
                  <ProgressWrapper
                    percentage={
                      proposal.total_votes > 0
                        ? proposal.votes_for / proposal.total_votes
                        : 0
                    }
                  >
                    <div className="flex justify-between w-full">
                      <Typography.Medium>Yes</Typography.Medium>
                      <Container slim className="flex gap-2">
                        <Typography.Medium>
                          {proposal.votes_for > 0
                            ? `${toBalance(
                                proposal.votes_for,
                                governor?.decimals
                              )} ${governor?.voteTokenMetadata.symbol}`
                            : "   "}
                        </Typography.Medium>
                        <Typography.Medium>
                          {`${
                            proposal.total_votes > 0
                              ? (
                                  (proposal.votes_for / proposal.total_votes) *
                                  100
                                ).toFixed(2)
                              : 0
                          }%`}
                        </Typography.Medium>
                      </Container>
                    </div>
                  </ProgressWrapper>
                  <ProgressWrapper
                    percentage={
                      proposal.total_votes > 0
                        ? proposal.votes_against / proposal.total_votes
                        : 0
                    }
                  >
                    <div className="flex justify-between w-full">
                      <Typography.Medium>No</Typography.Medium>
                      <Container slim className="flex gap-2">
                        <Typography.Medium>
                          {proposal.votes_against > 0
                            ? `${toBalance(
                                proposal.votes_against,
                                governor?.decimals
                              )} ${governor?.voteTokenMetadata.symbol}`
                            : "   "}
                        </Typography.Medium>
                        <Typography.Medium>
                          {`${
                            proposal.total_votes > 0
                              ? (
                                  (proposal.votes_against /
                                    proposal.total_votes) *
                                  100
                                ).toFixed(2)
                              : 0
                          }%`}
                        </Typography.Medium>
                      </Container>
                    </div>
                  </ProgressWrapper>
                  <ProgressWrapper
                    percentage={
                      proposal.total_votes > 0
                        ? proposal.votes_abstain / proposal.total_votes
                        : 0
                    }
                  >
                    <div className="flex justify-between w-full">
                      <Typography.Medium>Abstain</Typography.Medium>
                      <Container slim className="flex gap-2">
                        <Typography.Medium>
                          {proposal.votes_abstain > 0
                            ? `${toBalance(
                                proposal.votes_abstain,
                                governor?.decimals
                              )} ${governor?.voteTokenMetadata.symbol}`
                            : "   "}
                        </Typography.Medium>
                        <Typography.Medium>
                          {`${
                            proposal.total_votes > 0
                              ? (
                                  (proposal.votes_abstain /
                                    proposal.total_votes) *
                                  100
                                ).toFixed(2)
                              : 0
                          }%`}
                        </Typography.Medium>
                      </Container>
                    </div>
                  </ProgressWrapper>
                </div>
                <Typography.Tiny className="text-snapLink">
                  {/* X days remaining / ended X days ago  */}{" "}
                  {getRelativeProposalPeriod(
                    proposalStatus,
                    proposal.vote_start,
                    proposal.vote_end,
                    currentBlockNumber
                  )}
                </Typography.Tiny>
              </div>
            </Box>
          );
        })}
      </Container>
    </Container>
  );
}

Proposals.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default Proposals;
import governors from "../../../public/governors/governors.json";
import { GetStaticPaths, GetStaticProps } from "next";
export const getStaticProps = ((context) => {
  return { props: { dao: context.params?.dao?.toString() || "" } };
}) satisfies GetStaticProps<{
  dao: string;
}>;
export const getStaticPaths = (async () => {
  return {
    paths: governors.map((governor) => {
      return {
        params: {
          dao: governor.address,
        },
      };
    }),
    fallback: false, // false or "blocking"
  };
}) satisfies GetStaticPaths;
