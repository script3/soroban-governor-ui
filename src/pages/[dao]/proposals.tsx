import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { ProgressWrapper } from "@/components/common/ProgressWrapper";
import Typography from "@/components/common/Typography";
import { classByStatus } from "@/constants";

import { getRelativeProposalPeriod } from "@/utils/date";
import { shortenAddress } from "@/utils/shortenAddress";
import { useState } from "react";

import { useGovernor, useProposals, useVoteTokenBalance } from "@/hooks/api";
import { scaleNumberToBigInt, toBalance } from "@/utils/formatNumber";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/wallet";
function Proposals() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [toWrap, setToWrap] = useState<string>("");
  const { wrapToken } = useWallet();
  const router = useRouter();
  const pathname = router.pathname;
  const params = router.query;
  const decimals = 7;
  const { balance } = useVoteTokenBalance(
    "CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI",
    { placeholderData: BigInt(0) }
  );
  const { proposals } = useProposals(params.dao as string, {
    placeholderData: [],
  });
  const { governor } = useGovernor(params.dao as string, {
    placeholderData: {},
  });

  function handleWrapClick() {
    const amount = scaleNumberToBigInt(toWrap, decimals);
    wrapToken(
      "CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI",
      amount,
      false
    ).then((res) => {
      console.log({ res });
    });
  }

  return (
    <Container slim className="flex flex-col gap-4">
      <Container className="gap-4 ">
        <Box className="p-3 flex gap-3 flex-col ">
          <Container slim className="flex flex-col justify-center p-1 ">
            <Typography.P>
              Get voting power by wrapping your underlying tokens
            </Typography.P>
            <Typography.Small className="text-snapLink">
              current voting power: {toBalance(balance, 7)}{" "}
              {/* {governor.name || "$VOTE"} */}
            </Typography.Small>
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
              disabled={!toWrap}
            >
              Wrap tokens
            </Button>
          </Container>
        </Box>
      </Container>
      <Container className="flex justify-between items-center  flex-wrap py-6 gap-3">
        <Typography.Huge className="hidden lg:block text-white w-full mb-4">
          Proposals
        </Typography.Huge>
        <div className="flex w-full  md:w-60">
          <Input
            value={searchValue}
            placeholder="search proposals"
            onChange={setSearchValue}
          />
        </div>

        <Button
          onClick={() => {
            console.log({
              pathname,
              params,
              split: pathname.split("/")[1],
              id: params.dao,
            });
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
        {proposals.map((proposal, ind) => (
          <Box key={proposal.id + ind} className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Typography.Small className="font-bold">
                {shortenAddress(proposal.proposer)}
              </Typography.Small>
              <Chip className={classByStatus[proposal.status]}>
                {proposal.status}
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
                {proposal.description}
              </Typography.P>
              <div className="flex flex-col gap-2">
                {/* votes progress bar */}
                <ProgressWrapper
                  percentage={proposal.votes_for / proposal.total_votes}
                >
                  <div className="flex justify-between w-full">
                    <Typography.Medium>Yes</Typography.Medium>
                    <Typography.Medium>
                      {`${(
                        (proposal.votes_for / proposal.total_votes) *
                        100
                      ).toFixed(2)}%`}
                    </Typography.Medium>
                  </div>
                </ProgressWrapper>
                <ProgressWrapper
                  percentage={proposal.votes_against / proposal.total_votes}
                >
                  <div className="flex justify-between w-full">
                    <Typography.Medium>No</Typography.Medium>
                    <Typography.Medium>
                      {`${(
                        (proposal.votes_against / proposal.total_votes) *
                        100
                      ).toFixed(2)}%`}
                    </Typography.Medium>
                  </div>
                </ProgressWrapper>
                <ProgressWrapper
                  percentage={proposal.votes_abstain / proposal.total_votes}
                >
                  <div className="flex justify-between w-full">
                    <Typography.Medium>Abstain</Typography.Medium>
                    <Typography.Medium>
                      {`${(
                        (proposal.votes_abstain / proposal.total_votes) *
                        100
                      ).toFixed(2)}%`}
                    </Typography.Medium>
                  </div>
                </ProgressWrapper>
              </div>
              <Typography.Tiny className="text-snapLink">
                {/* X days remaining / ended X days ago  */}{" "}
                {getRelativeProposalPeriod(
                  proposal.status,
                  proposal.vote_start,
                  proposal.vote_end
                )}
              </Typography.Tiny>
            </div>
          </Box>
        ))}
      </Container>
    </Container>
  );
}

Proposals.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default Proposals;
