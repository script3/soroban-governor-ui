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

import { useCurrentBlockNumber, useGovernor, useProposals } from "@/hooks/api";
import { toBalance } from "@/utils/formatNumber";
import { useRouter } from "next/router";
import { stripMarkdown } from "@/utils/string";
import { getStatusByProposalState } from "@/utils/proposal";
function Proposals() {
  const [searchValue, setSearchValue] = useState<string>("");

  const router = useRouter();
  const { blockNumber: currentBlockNumber } = useCurrentBlockNumber();

  const params = router.query;

  const { governor } = useGovernor(params.dao as string, {
    placeholderData: {},
  });

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
            router.push(`/${params.dao}/proposal`, undefined, {
              scroll: false,
            });
          }}
          className="px-6 !w-full  md:!w-40 active:!opacity-90  "
        >
          New proposal
        </Button>
      </Container>
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
                  router.push(`/${params.dao}/${proposal.id}`);
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
                                governor.decimals
                              )} ${governor.voteTokenMetadata.symbol}`
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
                                governor.decimals
                              )} ${governor.voteTokenMetadata.symbol}`
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
                                governor.decimals
                              )} ${governor.voteTokenMetadata.symbol}`
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
