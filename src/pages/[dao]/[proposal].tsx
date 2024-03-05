import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Chip } from "@/components/common/Chip";
import { Dropdown, Item } from "@/components/common/Dropdown";
import Typography from "@/components/common/Typography";
import { classByStatus } from "@/constants";

import { shortenAddress } from "@/utils/shortenAddress";

import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { ViewMore } from "@/components/ViewMore";
import { formatDate } from "@/utils/date";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Modal } from "@/components/Modal";
import { VoteListItem } from "@/components/VoteListItem";
import { copyToClipboard } from "@/utils/string";
import Image from "next/image";

import { useRouter } from "next/router";
import {
  useGovernor,
  useProposal,
  useUserVoteByProposalId,
  useVoteTokenBalance,
  useVotes,
  useVotingPowerByProposal,
} from "@/hooks/api";
import { useWallet } from "@/hooks/wallet";
import { SelectableList } from "@/components/common/SelectableList";
import { toBalance } from "@/utils/formatNumber";
import { Loader } from "@/components/common/Loader";

const shareOptions: Item[] = [
  {
    text: "Share on Twitter",
    action: "twitter",
  },
  {
    text: "Copy link",
    action: "copy",
  },
];
export default function Proposal() {
  const router = useRouter();
  const params = router.query;
  const { governor: currentGovernor } = useGovernor(params.dao as string);
  const { proposal } = useProposal(Number(params.proposal), {
    enabled: !!params.proposal,
    placeholderData: {},
  });
  const { votes } = useVotes(Number(params.proposal), {
    enabled: !!proposal?.id,
    placeholderData: [],
  });
  const { userVote } = useUserVoteByProposalId(
    Number(params.proposal),
    "CAZA65HCGNNKGO7P66YNH3RSBVLCOJX5JXYCCUR66MMMBCT7ING4DBJL", //currentGovernor.address,
    {
      enabled: !!proposal?.id && !!currentGovernor.name,
      placeholderData: undefined,
    }
  );
  console.log({ userVote });
  const { vote, connected, connect, isLoading } = useWallet();

  const { votingPower } = useVotingPowerByProposal(
    "CCXM6K3GSFPUU2G7OGACE3X7NBRYG6REBJN6CWN6RUTYBVOKZ5KSC5ZI",
    380000,
    proposal.id,
    { placeholderData: BigInt(0) }
  );

  const [isFullView, setIsFullView] = useState(false);
  const [isVotesModalOpen, setIsVotesModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);

  function handleAction(action: string) {
    switch (action) {
      case "copy":
        copyToClipboard(`${window.location.origin}${router.pathname}`);
      default:
        break;
    }
  }
  function handleLinkClick(link: string) {
    window.open(link, "_blank");
  }

  function handleVote() {
    if (selectedSupport !== null) {
      vote(
        // proposal?.id as number,
        1,
        selectedSupport,
        false,
        "CAZA65HCGNNKGO7P66YNH3RSBVLCOJX5JXYCCUR66MMMBCT7ING4DBJL"
      );
    }
  }

  return (
    <Container className="flex flex-col gap-6 ">
      <Container slim className="flex flex-row gap-1 items-end justify-start">
        <Typography.Small
          className="cursor-pointer "
          onClick={() => {
            router.push(`/${currentGovernor?.name}/proposals`);
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
          {proposal.title}
        </Typography.Small>
      </Container>
      {!!proposal.id && (
        <Container
          slim
          className="flex flex-col px-0 md:px-4 gap-4 mx-auto max-w-[1012px] mt-[20px] w-auto m-auto lg:flex-row "
        >
          <Container
            slim
            className="relative  lg:w-8/12 lg:pr-5 flex flex-col gap-4 "
          >
            <Container slim className="flex flex-col mb-2">
              <Chip className={classByStatus[proposal.status] + " mb-4"}>
                {proposal.status}
              </Chip>
              <Typography.Big className="break-words leading-8 sm:leading-[44px]">
                {proposal.title}
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
                <Container slim className="flex items-center">
                  <Dropdown
                    placement="bottom-end"
                    chevron={false}
                    noBorder
                    buttonText={<Typography.P>Share </Typography.P>}
                    items={shareOptions}
                    onSelect={(action) => {
                      handleAction(action);
                    }}
                  />
                  <Dropdown
                    chevron={false}
                    noBorder
                    buttonText={
                      <Image
                        src="/icons/three-dots.svg"
                        width={20}
                        height={20}
                        alt="threedots"
                      />
                    }
                    items={shareOptions}
                    onSelect={(action) => {
                      handleAction(action);
                    }}
                  />
                </Container>
              </Container>
            </Container>
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
            <Container slim>
              <Box>
                <Container className="border-b border-snapBorder flex !flex-row justify-between ">
                  <Typography.Medium className=" !p-4 flex w-max">
                    {userVote !== null ? "Your vote is in" : "Cast your vote"}
                  </Typography.Medium>
                  {connected && votingPower > BigInt(0) && (
                    <Typography.Medium className=" !p-4 flex w-max text-snapLink ">
                      Voting Power: {toBalance(votingPower, 7)}
                    </Typography.Medium>
                  )}
                </Container>
                <Container className="flex flex-col gap-4 justify-center p-4 w-full items-center">
                  <SelectableList
                    disabled={
                      isLoading ||
                      userVote !== null ||
                      votingPower === BigInt(0) ||
                      !connected
                    }
                    onSelect={setSelectedSupport}
                    items={[
                      { value: 0, label: "Yes" },
                      { value: 1, label: "No" },
                      { value: 2, label: "Abstain" },
                    ]}
                    selected={userVote ?? selectedSupport}
                  />
                  <Button
                    onClick={() => {
                      if (connected && userVote !== null) {
                        if (votingPower > BigInt(0)) {
                          handleVote();
                        } else {
                          router.replace(`/${params.dao}/proposals?wrap=true`);
                        }
                      } else {
                        connect();
                      }
                    }}
                    className="!bg-primary px-16 !w-full"
                    disabled={isLoading || userVote !== undefined}
                  >
                    {isLoading ? (
                      <Loader />
                    ) : connected ? (
                      votingPower > BigInt(0) ? (
                        "Vote"
                      ) : (
                        "Get vote tokens"
                      )
                    ) : (
                      "Connect Wallet to Vote"
                    )}
                  </Button>
                </Container>
              </Box>
            </Container>
            <Container slim>
              <Box className="!px-0">
                <Container className="py-4 border-b flex gap-1 border-snapBorder">
                  <Typography.P className="inline">Votes </Typography.P>
                  <Chip className="!px-1 inline !min-w-[20px] bg-snapLink text-white">
                    {proposal.total_votes}
                  </Chip>
                </Container>
                {votes.slice(0, 10).map((vote, index) => (
                  <VoteListItem
                    key={index}
                    vote={vote}
                    index={index}
                    voteCount={proposal.total_votes}
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
                    {formatDate(new Date(proposal?.vote_start))}
                  </Typography.Small>
                </Container>
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">
                    End Date{" "}
                  </Typography.P>
                  <Typography.Small className="">
                    {formatDate(new Date(proposal?.vote_end))}
                  </Typography.Small>
                </Container>
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">ID </Typography.P>
                  <Typography.Small className="">
                    {proposal.id}
                  </Typography.Small>
                </Container>
              </Container>
            </Box>
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
                  endContent={
                    <>
                      <Typography.P>
                        {" "}
                        {Number(
                          (proposal.votes_for / proposal.total_votes).toFixed(2)
                        ) * 100}
                        %
                      </Typography.P>
                    </>
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
                  endContent={
                    <>
                      <Typography.P>
                        {" "}
                        {Number(
                          (
                            proposal.votes_against / proposal.total_votes
                          ).toFixed(2)
                        ) * 100}
                        %
                      </Typography.P>
                    </>
                  }
                  progress={
                    Number(
                      (proposal.votes_against / proposal.total_votes).toFixed(2)
                    ) * 100
                  }
                />{" "}
                <ProgressBar
                  className="flex flex-col gap-2 mb-4"
                  label="Abstain"
                  endContent={
                    <>
                      <Typography.P>
                        {" "}
                        {Number(
                          (
                            proposal.votes_abstain / proposal.total_votes
                          ).toFixed(2)
                        ) * 100}
                        %
                      </Typography.P>
                    </>
                  }
                  progress={
                    Number(
                      (proposal.votes_abstain / proposal.total_votes).toFixed(2)
                    ) * 100
                  }
                />{" "}
              </Container>
            </Box>
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
          {votes.map((vote, index) => (
            <VoteListItem
              key={index}
              vote={vote}
              index={index}
              voteCount={proposal.total_votes}
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
            className="!bg-primary px-16"
          >
            Continue
          </Button>
        </Container>
      </Modal>
    </Container>
  );
}
