import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Chip } from "@/components/common/Chip";
import Typography from "@/components/common/Typography";
import {
  ProposalActionEnum,
  ProposalStatusEnum,
  ProposalStatusText,
  classByProposalAction,
  classByStatus,
} from "@/constants";

import { shortenAddress } from "@/utils/shortenAddress";

import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { ViewMore } from "@/components/ViewMore";
import { formatDate, getProposalDate } from "@/utils/date";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Modal } from "@/components/Modal";
import { VoteListItem } from "@/components/proposal/VoteListItem";
import { copyToClipboard } from "@/utils/string";
import Image from "next/image";

import { useRouter } from "next/router";
import {
  useCurrentBlockNumber,
  useGovernor,
  useProposal,
  useUserVoteByProposalId,
  useVotes,
  useVotingPowerByProposal,
} from "@/hooks/api";
import { useWallet } from "@/hooks/wallet";
import { SelectableList } from "@/components/common/SelectableList";
import { toBalance } from "@/utils/formatNumber";
import { Loader } from "@/components/common/Loader";
import { getStatusByProposalState } from "@/utils/proposal";
import { VoteSupport } from "@/types";
import { useTemporaryState } from "@/hooks/useTemporaryState";
import { TabBar } from "@/components/common/Tab/TabBar";
import { ProposalAction } from "@/components/proposal/action/ProposalAction";

export default function Proposal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("Action");
  const params = router.query;
  const { governor: currentGovernor } = useGovernor(params.dao as string);

  const [copied, setCopied] = useTemporaryState(false, 1000, false);
  const { proposal, refetch } = useProposal(
    Number(params.id),
    currentGovernor?.address,
    currentGovernor?.settings?.vote_delay,
    currentGovernor?.settings?.vote_period,
    {
      enabled: !!params.id && !!currentGovernor?.address,
      placeholderData: {},
    }
  );

  const { blockNumber: currentBlockNumber } = useCurrentBlockNumber();
  const proposalStatus = getStatusByProposalState(
    proposal?.status,
    proposal?.vote_start,
    proposal?.vote_end,
    currentBlockNumber
  );
  const isExecutable =
    proposalStatus === ProposalStatusEnum.Successful &&
    proposal?.action.tag !== ProposalActionEnum.SNAPSHOT &&
    proposal?.executionETA <= currentBlockNumber;
  const { votes, refetch: refetchVotes } = useVotes(
    proposal?.id,
    currentGovernor?.address,
    {
      enabled: proposal?.id > -1,
      placeholderData: [],
    }
  );
  const { userVote } = useUserVoteByProposalId(
    Number(params.id),
    currentGovernor?.address,
    {
      enabled: proposal?.id > -1 && !!currentGovernor?.address,
      placeholderData: undefined,
    }
  );

  const {
    walletAddress,
    vote,
    connected,
    connect,
    isLoading,
    executeProposal,
    closeProposal,
    cancelProposal,
  } = useWallet();

  const { votingPower } = useVotingPowerByProposal(
    currentGovernor?.voteTokenAddress,
    proposal?.vote_start,
    proposal?.id,
    currentBlockNumber,
    {
      placeholderData: BigInt(0),
      enabled:
        connected &&
        proposal?.id > -1 &&
        !!currentGovernor?.voteTokenAddress &&
        !!currentBlockNumber,
    }
  );

  const [isFullView, setIsFullView] = useState(false);
  const [isVotesModalOpen, setIsVotesModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);

  function handleLinkClick(link: string) {
    window.open(link, "_blank");
  }
  function handleVote() {
    if (selectedSupport !== null) {
      vote(
        proposal?.id as number,
        selectedSupport,
        false,
        currentGovernor.address
      ).then(() => {
        refetch();
        refetchVotes();
      });
    }
  }

  function handleExecute() {
    executeProposal(proposal.id, currentGovernor.address).then(() => {
      refetch();
      refetchVotes();
    });
  }

  function handleClose() {
    closeProposal(proposal.id, currentGovernor.address).then(() => {
      refetch();
      refetchVotes();
    });
  }

  function handleCancel() {
    cancelProposal(proposal.id, currentGovernor.address).then(() => {
      refetch();
      refetchVotes();
    });
  }

  return (
    <Container className="flex flex-col gap-6 ">
      <Container slim className="flex flex-row gap-1 items-end justify-start">
        <Typography.Small
          className="cursor-pointer "
          onClick={() => {
            router.push(`/${currentGovernor?.address}/proposals`);
          }}
        >
          {currentGovernor?.name}
        </Typography.Small>
        <Image
          src="/icons/chevron-right.svg"
          width={20}
          height={20}
          className="shrink-0 text-sm stroke-snapLink"
          alt="chevright"
        />
        <Typography.Small className=" opacity-40 line-clamp-1 max-w-[380px]">
          {" "}
          {proposal?.title}
        </Typography.Small>
      </Container>

      {proposal?.id !== undefined && (
        <Container
          slim
          className="flex flex-col px-0 md:px-4 gap-4 mx-auto lg:w-[1012px]  2xl:w-[1400px]  mt-[20px] w-auto m-auto lg:flex-row "
        >
          <Container
            slim
            className="relative py-4 lg:w-8/12 lg:pr-5 flex flex-col gap-4 md:min-w-[40rem] "
          >
            <Container slim className="flex flex-col mb-2">
              <Container slim className="flex flex-row gap-2">
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
              <Typography.Big className="break-words leading-8 sm:leading-[44px]">
                {proposal?.title}
              </Typography.Big>
              <Container slim className="flex flex-row justify-between">
                <Container slim>
                  <Typography.Small className="text-snapLink">
                    {currentGovernor?.name} by{" "}
                    <Typography.Small className="!text-white font-bold">
                      {shortenAddress(proposal.proposer)}
                    </Typography.Small>
                  </Typography.Small>
                </Container>
                <Container slim className="flex items-center gap-2">
                  {isExecutable && connected && (
                    <Button
                      className={`w-32 !bg-secondary ${
                        isLoading ? "!py-1.5" : ""
                      } `}
                      disabled={isLoading}
                      onClick={handleExecute}
                    >
                      {isLoading ? <Loader /> : "Execute"}
                    </Button>
                  )}
                  {proposalStatus === ProposalStatusEnum.Open &&
                    proposal.vote_end < currentBlockNumber &&
                    connected && (
                      <Button
                        className={`w-32 !bg-secondary ${
                          isLoading ? "!py-1.5" : ""
                        } `}
                        disabled={isLoading}
                        onClick={handleClose}
                      >
                        {isLoading ? <Loader /> : "Close"}
                      </Button>
                    )}
                  {proposal?.proposer === walletAddress &&
                    connected &&
                    proposalStatus === ProposalStatusEnum.Pending && (
                      <Button
                        className={`w-32 !bg-secondary ${
                          isLoading ? "!py-1.5" : ""
                        } `}
                        disabled={isLoading}
                        onClick={handleCancel}
                      >
                        {isLoading ? <Loader /> : "Cancel"}
                      </Button>
                    )}
                  <Button
                    onClick={() => {
                      copyToClipboard(
                        `${window.location.origin}${router.asPath}`
                      );
                      setCopied(true);
                    }}
                    className={`${
                      copied ? "!bg-success text-white" : ""
                    } text-snapLink gap-1`}
                  >
                    {copied ? (
                      <Image
                        src="/icons/check.svg"
                        width={18}
                        height={18}
                        alt="link"
                      />
                    ) : (
                      <Image
                        src="/icons/link.svg"
                        width={18}
                        height={18}
                        alt="link"
                      />
                    )}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                </Container>
              </Container>
              <Container
                slim
                className="flex flex-row gap-1  justify-start px-0 md:px-2   mt-[20px] w-auto"
              >
                <TabBar
                  tabs={[{ name: "Action" }, { name: "Description" }]}
                  onClick={({ name }) => {
                    setActiveTab(name);
                  }}
                  activeTabName={activeTab}
                />
              </Container>
            </Container>

            {activeTab === "Description" && (
              <>
                <Container slim>
                  <ViewMore onChange={setIsFullView} isFull={isFullView}>
                    <Container
                      slim
                      className={`${
                        isFullView
                          ? "overflow-hidden mb-[92px]"
                          : "overflow-hidden h-[500px] mb-[56px]"
                      }`}
                    >
                      <MarkdownPreview body={proposal.description} />
                    </Container>
                  </ViewMore>
                </Container>
                <Container slim>
                  {!!proposal.link && (
                    <Box
                      className="flex min-h-20 items-center cursor-pointer hover:border hover:border-snapLink active:opacity-50 my-2 justify-center gap-2"
                      onClick={() => {
                        setIsLinkModalOpen(true);
                      }}
                    >
                      <Typography.P className="flex  text-lg items-center gap-2">
                        Discussion link{" "}
                      </Typography.P>
                      <Typography.Small className="text-snapLink flex ">
                        ({proposal.link})
                      </Typography.Small>
                    </Box>
                  )}
                </Container>
              </>
            )}
            {activeTab === "Action" && (
              <Container>
                <ProposalAction
                  governor={currentGovernor}
                  proposal={proposal}
                />
              </Container>
            )}
            {proposalStatus === ProposalStatusEnum.Active && (
              <Container slim>
                <Box>
                  <Container className="border-b border-snapBorder flex !flex-row justify-between ">
                    <Typography.Medium className=" !p-4 flex w-max">
                      {userVote !== undefined
                        ? "Your vote is in"
                        : "Cast your vote"}
                    </Typography.Medium>
                    {connected && (
                      <Typography.Medium className=" !p-4 flex w-max text-snapLink ">
                        Proposal voting power:{" "}
                        {toBalance(votingPower, currentGovernor?.decimals)}
                      </Typography.Medium>
                    )}
                  </Container>
                  <Container className="flex flex-col gap-4 justify-center p-4 w-full items-center">
                    <SelectableList
                      disabled={
                        isLoading ||
                        userVote !== undefined ||
                        votingPower === BigInt(0) ||
                        !connected
                      }
                      onSelect={setSelectedSupport}
                      items={[
                        { value: VoteSupport.For, label: "For" },
                        { value: VoteSupport.Against, label: "Against" },
                        { value: VoteSupport.Abstain, label: "Abstain" },
                      ]}
                      selected={userVote ?? selectedSupport}
                    />
                    <Button
                      onClick={() => {
                        if (connected && userVote === undefined) {
                          handleVote();
                        } else {
                          connect();
                        }
                      }}
                      className="!bg-secondary px-16 !w-full"
                      disabled={
                        isLoading ||
                        userVote !== undefined ||
                        proposalStatus !== ProposalStatusEnum.Active ||
                        votingPower === BigInt(0)
                      }
                    >
                      {isLoading ? (
                        <Loader />
                      ) : connected ? (
                        "Vote"
                      ) : (
                        "Connect Wallet to Vote"
                      )}
                    </Button>
                  </Container>
                </Box>
              </Container>
            )}
            {votes?.length > 0 && (
              <Container slim>
                <Box className="!px-0">
                  <Container className="py-4 border-b flex gap-1 border-snapBorder">
                    <Typography.P className="inline">Votes </Typography.P>
                    <Chip className="!px-2 inline !min-w-[20px] bg-secondary text-white">
                      {votes.length}
                    </Chip>
                  </Container>
                  {votes?.slice(0, 10).map((vote, index) => (
                    <VoteListItem
                      key={index}
                      vote={vote}
                      index={index}
                      decimals={currentGovernor?.decimals as number}
                      voteCount={proposal.total_votes}
                      symbol={currentGovernor?.voteTokenMetadata.symbol}
                    />
                  ))}
                  <div
                    className="block rounded-b-none border-snapBorder cursor-pointer border-t p-4 text-center md:rounded-b-md justify-center"
                    onClick={() => {
                      setIsVotesModalOpen(true);
                    }}
                  >
                    {" "}
                    See more
                  </div>
                </Box>
              </Container>
            )}
          </Container>
          <Container
            slim
            className="w-full flex flex-col gap-4 lg:w-4/12 lg:min-w-[321px] "
          >
            <Box className="!p-0">
              <Container slim className="border-b mb-2 border-snapBorder">
                <Typography.Medium className=" !p-4 flex w-full ">
                  Information
                </Typography.Medium>
              </Container>
              <Container slim>
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">
                    Voting system
                  </Typography.P>
                  <Typography.Small className="">
                    Single choice voting
                  </Typography.Small>
                </Container>
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">
                    Start date
                  </Typography.P>
                  <Typography.Small className="">
                    {formatDate(
                      getProposalDate(proposal?.vote_start, currentBlockNumber)
                    )}
                  </Typography.Small>
                </Container>
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">
                    End date{" "}
                  </Typography.P>
                  <Typography.Small className="">
                    {formatDate(
                      getProposalDate(proposal?.vote_end, currentBlockNumber)
                    )}
                  </Typography.Small>
                </Container>
                {proposal.executionETA > 0 && (
                    <Container className="flex justify-between mb-2">
                      <Typography.P className=" text-snapLink">
                        Execution unlocked{" "}
                      </Typography.P>
                      <Typography.Small className="">
                        {formatDate(
                          getProposalDate(
                            proposal?.executionETA,
                            currentBlockNumber
                          )
                        )}
                      </Typography.Small>
                    </Container>
                  )
                }
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">ID </Typography.P>
                  <Typography.Small className="">
                    {proposal.id}
                  </Typography.Small>
                </Container>
              </Container>
            </Box>
            {proposalStatus !== ProposalStatusEnum.Canceled && (
              <Box className="!p-0">
                <Container slim className="border-b mb-2 border-snapBorder">
                  <Typography.Medium className=" !p-4 flex w-full ">
                    Results
                  </Typography.Medium>
                </Container>
                <Container className="flex flex-col gap-4">
                  <ProgressBar
                    className="flex flex-col gap-2 mb-4"
                    label="Yes"
                    barClassName={
                      proposalStatus === ProposalStatusEnum.Active
                        ? "bg-secondary"
                        : "bg-neutral-200"
                    }
                    endContent={
                      <Container slim>
                        <Typography.P>
                          {proposal.votes_for > 0
                            ? `${toBalance(
                                proposal.votes_for,
                                currentGovernor.decimals
                              )} ${currentGovernor.voteTokenMetadata.symbol}`
                            : "   "}
                        </Typography.P>
                        <Typography.P>
                          {" "}
                          {proposal.votes_for > 0
                            ? Number(
                                (
                                  proposal.votes_for / proposal.total_votes
                                ).toFixed(2)
                              ) * 100
                            : 0}
                          %
                        </Typography.P>
                      </Container>
                    }
                    progress={
                      Number(
                        (proposal.votes_for / proposal.total_votes).toFixed(2)
                      ) * 100
                    }
                  />{" "}
                  <ProgressBar
                    className="flex flex-col gap-2 mb-4"
                    label="No"
                    barClassName={
                      proposalStatus === ProposalStatusEnum.Active
                        ? "bg-secondary"
                        : "bg-neutral-200"
                    }
                    endContent={
                      <Container slim>
                        <Typography.P>
                          {proposal.votes_against > 0
                            ? `${toBalance(
                                proposal.votes_against,
                                currentGovernor.decimals
                              )} ${currentGovernor.voteTokenMetadata.symbol}`
                            : "   "}
                        </Typography.P>
                        <Typography.P>
                          {" "}
                          {proposal.votes_against > 0
                            ? Number(
                                (
                                  proposal.votes_against / proposal.total_votes
                                ).toFixed(2)
                              ) * 100
                            : 0}
                          %
                        </Typography.P>
                      </Container>
                    }
                    progress={
                      Number(
                        (proposal.votes_against / proposal.total_votes).toFixed(
                          2
                        )
                      ) * 100
                    }
                  />{" "}
                  <ProgressBar
                    className="flex flex-col gap-2 mb-4"
                    label="Abstain"
                    barClassName={
                      proposalStatus === ProposalStatusEnum.Active
                        ? "bg-secondary"
                        : "bg-neutral-200"
                    }
                    endContent={
                      <Container slim>
                        <Typography.P>
                          {proposal.votes_abstain > 0
                            ? `${toBalance(
                                proposal.votes_abstain,
                                currentGovernor.decimals
                              )} ${currentGovernor.voteTokenMetadata.symbol}`
                            : "   "}
                        </Typography.P>
                        <Typography.P>
                          {" "}
                          {proposal.votes_abstain > 0
                            ? Number(
                                (
                                  proposal.votes_abstain / proposal.total_votes
                                ).toFixed(2)
                              ) * 100
                            : 0}
                          %
                        </Typography.P>
                      </Container>
                    }
                    progress={
                      Number(
                        (proposal.votes_abstain / proposal.total_votes).toFixed(
                          2
                        )
                      ) * 100
                    }
                  />{" "}
                </Container>
              </Box>
            )}
          </Container>
        </Container>
      )}

      <Modal
        isOpen={isVotesModalOpen}
        onClose={() => {
          setIsVotesModalOpen(false);
        }}
        title="Votes"
      >
        <Container slim className="h-max !p-4">
          {votes?.map((vote, index) => (
            <VoteListItem
              decimals={currentGovernor?.decimals as number}
              key={index}
              vote={vote}
              index={index}
              voteCount={proposal.total_votes}
              symbol={currentGovernor?.voteTokenMetadata.symbol}
            />
          ))}
        </Container>
      </Modal>
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
        }}
        title="Proceed with caution!"
      >
        <Container
          slim
          className="h-max !p-4 text-center mb-2 border-b border-snapBorder w-full"
        >
          <Typography.P className="text-snapLink">
            This link will take you to{" "}
            <Typography.P className="text-white">{proposal.link}</Typography.P>
            <br />
            Be careful, this link could be malicious. Are you sure you want to
            continue?
          </Typography.P>
        </Container>
        <Container className="flex gap-4 justify-center p-4">
          <Button
            onClick={() => {
              setIsLinkModalOpen(false);
            }}
            className="px-16"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleLinkClick(proposal.link);
            }}
            className="!bg-secondary px-16"
          >
            Continue
          </Button>
        </Container>
      </Modal>
    </Container>
  );
}

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
    fallback: false,
  };
}) satisfies GetStaticPaths;
