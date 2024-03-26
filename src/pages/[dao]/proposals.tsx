import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { ProgressWrapper } from "@/components/common/ProgressWrapper";
import Typography from "@/components/common/Typography";
import { ProposalStatusText, classByStatus } from "@/constants";

import { getRelativeProposalPeriod } from "@/utils/date";
import { shortenAddress } from "@/utils/shortenAddress";
import { useState } from "react";

import {
  useCurrentBlockNumber,
  useGovernor,
  useProposals,
  useUnderlyingTokenBalance,
  useVoteTokenBalance,
} from "@/hooks/api";
import { scaleNumberToBigInt, toBalance } from "@/utils/formatNumber";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/wallet";

import { Loader } from "@/components/common/Loader";
import { stripMarkdown } from "@/utils/string";
import { getStatusByProposalState } from "@/utils/proposal";
function Proposals() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [toWrap, setToWrap] = useState<string>("");
  const [toUnwrap, setToUnwrap] = useState<string>("");
  const { wrapToken, unwrapToken, connect, connected, isLoading } = useWallet();
  const router = useRouter();
  const { blockNumber: currentBlockNumber } = useCurrentBlockNumber();

  const params = router.query;

  const { governor } = useGovernor(params.dao as string, {
    placeholderData: {},
  });
  const { balance, refetch: refetchBalance } = useVoteTokenBalance(
    governor?.voteTokenAddress,
    {
      placeholderData: BigInt(0),
      enabled: connected && !!governor?.voteTokenAddress,
    }
  );

  const { balance: underlyingTokenBalance, refetch: refetchunderlying } =
    useUnderlyingTokenBalance(governor?.underlyingTokenAddress || "", {
      enabled: connected && !!governor?.underlyingTokenAddress,
      placeholderData: BigInt(0),
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

  function handleWrapClick() {
    if (!connected) {
      connect();
      return;
    } else {
      const amount = scaleNumberToBigInt(toWrap, governor.decimals);
      wrapToken(governor.voteTokenAddress, amount, false).then((res) => {
        refetchBalance();
        refetchunderlying();
        setToUnwrap("");
        setToWrap("");
      });
    }
  }

  function handleUnwrapClick() {
    if (!connected) {
      connect();
      return;
    } else {
      const amount = scaleNumberToBigInt(toUnwrap, governor.decimals);
      unwrapToken(governor.voteTokenAddress, amount, false).then((res) => {
        refetchunderlying();
        refetchBalance();
        setToUnwrap("");
        setToWrap("");
      });
    }
  }

  return (
    <Container slim className="flex flex-col gap-4">
      <Container className="gap-4 flex flex-col ">
        <Box className="p-3 flex gap-3 flex-col ">
          <Container slim className="flex flex-col justify-center p-1 ">
            <Typography.P>
              Get voting tokens by wrapping your underlying tokens
            </Typography.P>
            {connected && (
              <Typography.Small className="text-snapLink">
                Current Underlying token balance:{" "}
                {toBalance(underlyingTokenBalance, governor.decimals)}{" "}
                {/* {governor.name || "$VOTE"} */}
              </Typography.Small>
            )}
          </Container>
          <Container slim className="w-full flex flex-row  gap-3">
            <Input
              className="!w-1/3 flex"
              placeholder="Amount to wrap"
              onChange={setToWrap}
              value={toWrap}
              type="number"
            />
            <Button
              className="w-1/2 flex !bg-white text-snapBorder active:opacity-50 "
              onClick={handleWrapClick}
              disabled={isLoading || (connected && !toWrap)}
            >
              {isLoading ? (
                <Loader />
              ) : connected ? (
                "Wrap Tokens"
              ) : (
                "Connect wallet"
              )}
            </Button>
          </Container>
        </Box>
        {balance > BigInt(0) && (
          <Box className="p-3 flex gap-3 flex-col ">
            <Container slim className="flex flex-col justify-center p-1 ">
              <Typography.P>
                Unwrap your voting tokens to get back your underlying tokens
              </Typography.P>
              {connected && (
                <Typography.Small className="text-snapLink">
                  Current Vote token balance:{" "}
                  {toBalance(balance, governor.decimals)}{" "}
                  {/* {governor.name || "$VOTE"} */}
                </Typography.Small>
              )}
            </Container>
            <Container slim className="w-full flex flex-row  gap-3">
              <Input
                className="!w-1/3 flex"
                placeholder="Amount to unwrap"
                onChange={setToUnwrap}
                value={toUnwrap}
                type="number"
              />
              <Button
                className="w-1/2 flex !bg-white text-snapBorder active:opacity-50 "
                onClick={handleUnwrapClick}
                disabled={isLoading || (connected && !toUnwrap)}
              >
                {isLoading ? (
                  <Loader />
                ) : connected ? (
                  "Unwrap Tokens"
                ) : (
                  "Connect wallet"
                )}
              </Button>
            </Container>
          </Box>
        )}
      </Container>
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
                <Chip className={`${classByStatus[proposalStatus]} mb-4`}>
                  {ProposalStatusText[proposalStatus]}
                </Chip>
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
