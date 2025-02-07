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
import DAOLayout from "@/layouts/dao";

import { getRelativeProposalPeriod } from "@/utils/date";
import { shortenAddress } from "@/utils/shortenAddress";
import { useMemo, useState } from "react";

import {
  useCurrentBlockNumber,
  useDelegate,
  useGovernor,
  useProposals,
  useVotingPower,
} from "@/hooks/api";
import { useWallet } from "@/hooks/wallet";
import { toBalance } from "@/utils/formatNumber";
import { stripMarkdown } from "@/utils/string";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import governors from "../../../public/governors/governors.json";

function Proposals() {
  const router = useRouter();
  const params = router.query;

  const { connected, walletAddress } = useWallet();

  const { data: currentBlockNumber } = useCurrentBlockNumber();
  const governor = useGovernor(params.dao as string);
  const { data: delegateAddressEntry, refetch: refetchDelegate } = useDelegate(
    governor?.voteTokenAddress
  );
  const delegateAddress = delegateAddressEntry?.entry;
  const hasDelegate =
    connected &&
    delegateAddress !== undefined &&
    delegateAddress !== walletAddress;
  const { data: votingPowerEntry } = useVotingPower(governor?.voteTokenAddress);
  const votingPower = votingPowerEntry?.entry ?? BigInt(0);
  const { data: proposals } = useProposals(
    governor?.address,
    currentBlockNumber
  );

  const [searchValue, setSearchValue] = useState<string>("");

  const filteredProposals = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    return (proposals ?? []).filter((proposal) =>
      `${proposal.title} ${proposal.description} ${proposal.proposer}`
        .toLowerCase()
        .includes(searchLower)
    );
  }, [searchValue, proposals]);

  const isOldYBXGovernor =
    governor?.address ===
    "CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV";

  return (
    <Container slim className="flex flex-col gap-4">
      <Container className="flex justify-between items-center  flex-wrap py-6 gap-3">
        <Typography.Huge className="hidden lg:block text-white w-full mb-4">
          Proposals
        </Typography.Huge>
        {isOldYBXGovernor && (
          <Container
            slim
            className="py-2 gap-1 flex flex-row items-center bg-warningOpaque rounded pl-2 mb-2 w-full"
          >
            <Image
              src="/icons/report.svg"
              width={28}
              height={28}
              alt={"close"}
            />
            <Typography.P className="text-warning">
              {"This DAO is being sunset. Please unbond your tokens.\n\n"}
            </Typography.P>
          </Container>
        )}
        <div className="flex w-full  md:w-60">
          <Input
            icon={
              <Image
                src="/icons/search.svg"
                width={20}
                height={20}
                alt="search"
              />
            }
            value={searchValue}
            placeholder="Search proposals"
            onChange={(e) => setSearchValue(e)}
          />
        </div>

        <Button
          onClick={() => {
            router.push(`/${params.dao}/propose`, undefined, {
              scroll: false,
            });
          }}
          className="px-6 !w-full  md:!w-48 active:!opacity-90 flex gap-2 items-center "
        >
          New proposal
          <Image
            src="/icons/add-circle.svg"
            width={20}
            height={20}
            alt="plus"
          />
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
                  {toBalance(votingPower, governor?.decimals)} votes
                </Typography.P>
                {hasDelegate && (
                  <Chip className="!bg-transparent border border-secondary text-secondary">
                    Delegated
                  </Chip>
                )}
              </Container>
            </Container>

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
          </Box>
        </Container>
      )}
      {/* proposals  */}
      <Container className="flex flex-col gap-4">
        {filteredProposals.map((proposal, ind) => {
          const total_votes = proposal
            ? proposal.vote_count._for +
              proposal.vote_count.against +
              proposal.vote_count.abstain
            : BigInt(0);
          const percent_for =
            proposal && total_votes > BigInt(0)
              ? Number(proposal.vote_count._for) / Number(total_votes)
              : 0;
          const percent_against =
            proposal && total_votes > BigInt(0)
              ? Number(proposal.vote_count.against) / Number(total_votes)
              : 0;
          const percent_abstain =
            proposal && total_votes > BigInt(0)
              ? Number(proposal.vote_count.abstain) / Number(total_votes)
              : 0;

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
                  <Chip className={`${classByStatus[proposal.status]} mb-4`}>
                    {ProposalStatusText[proposal.status]}
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
                  <ProgressWrapper percentage={percent_for}>
                    <div className="flex justify-between w-full">
                      <Typography.Medium>Yes</Typography.Medium>
                      <Container slim className="flex gap-2">
                        <Typography.Medium>
                          {proposal.vote_count._for > 0
                            ? `${toBalance(
                                proposal.vote_count._for,
                                governor?.decimals
                              )} -`
                            : "   "}
                        </Typography.Medium>
                        <Typography.Medium>
                          {`${
                            percent_for > 0
                              ? (percent_for * 100).toFixed(2)
                              : "0"
                          }%`}
                        </Typography.Medium>
                      </Container>
                    </div>
                  </ProgressWrapper>
                  <ProgressWrapper percentage={percent_against}>
                    <div className="flex justify-between w-full">
                      <Typography.Medium>No</Typography.Medium>
                      <Container slim className="flex gap-2">
                        <Typography.Medium>
                          {proposal.vote_count.against > 0
                            ? `${toBalance(
                                proposal.vote_count.against,
                                governor?.decimals
                              )} -`
                            : "   "}
                        </Typography.Medium>
                        <Typography.Medium>
                          {`${
                            percent_against > 0
                              ? (percent_against * 100).toFixed(2)
                              : "0"
                          }%`}
                        </Typography.Medium>
                      </Container>
                    </div>
                  </ProgressWrapper>
                  <ProgressWrapper percentage={percent_abstain}>
                    <div className="flex justify-between w-full">
                      <Typography.Medium>Abstain</Typography.Medium>
                      <Container slim className="flex gap-2">
                        <Typography.Medium>
                          {proposal.vote_count.abstain > 0
                            ? `${toBalance(
                                proposal.vote_count.abstain,
                                governor?.decimals
                              )} -`
                            : "   "}
                        </Typography.Medium>
                        <Typography.Medium>
                          {`${
                            percent_abstain > 0
                              ? (percent_abstain * 100).toFixed(2)
                              : "0"
                          }%`}
                        </Typography.Medium>
                      </Container>
                    </div>
                  </ProgressWrapper>
                </div>
                <Typography.Tiny className="text-snapLink">
                  {/* X days remaining / ended X days ago  */}{" "}
                  {currentBlockNumber
                    ? getRelativeProposalPeriod(
                        proposal.vote_start,
                        proposal.vote_end,
                        currentBlockNumber
                      )
                    : "unkown"}
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
