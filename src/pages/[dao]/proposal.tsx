import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { ProgressBar } from "@/components/common/ProgressBar";
import { SelectableList } from "@/components/common/SelectableList";
import { TabBar } from "@/components/common/Tab/TabBar";
import Typography from "@/components/common/Typography";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { Modal } from "@/components/Modal";
import { ProposalAction } from "@/components/proposal/action/ProposalAction";
import { VoteListItem } from "@/components/proposal/VoteListItem";
import { ViewMore } from "@/components/ViewMore";
import {
  ProposalActionEnum,
  ProposalStatusText,
  classByProposalAction,
  classByStatus,
} from "@/constants";
import {
  useCurrentBlockNumber,
  useGovernor,
  useGovernorSettings,
  useProposal,
  useTotalSupplyByLedger,
  useUserVoteByProposalId,
  useVotes,
  useVotingPowerByLedger,
} from "@/hooks/api";
import { useTemporaryState } from "@/hooks/useTemporaryState";
import { useWallet } from "@/hooks/wallet";
import { ProposalStatusExt, VoteSupport } from "@/types";
import { formatDate, getProposalDate } from "@/utils/date";
import { toBalance } from "@/utils/formatNumber";
import { shortenAddress } from "@/utils/shortenAddress";
import { copyToClipboard } from "@/utils/string";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import { parseQuorumInfo } from "@/utils/vote";

export default function Proposal() {
  const router = useRouter();
  const params = router.query;

  const [activeTab, setActiveTab] = useState<string>("Action");
  const [copied, setCopied] = useTemporaryState(false, 1000, false);
  const {
    walletAddress,
    vote,
    connected,
    connect,
    isLoading,
    executeProposal,
    closeProposal,
    cancelProposal,
    restore,
  } = useWallet();

  const { data: currentBlockNumber } = useCurrentBlockNumber();
  const currentGovernor = useGovernor(params.dao as string);
  const {
    data: proposal,
    isFetched: isProposalFetched,
    refetch,
    isFetched,
  } = useProposal(
    currentGovernor?.address,
    Number(params.id),
    currentBlockNumber,
    !!params.id && !!currentGovernor?.address
  );
  const { data: governorSettings } = useGovernorSettings(
    currentGovernor?.address
  );

  const { data: tempVotes, refetch: refetchVotes } = useVotes(
    currentGovernor?.address,
    proposal?.id
  );
  const votes = tempVotes
    ? tempVotes.sort((a, b) => Number(b.amount) - Number(a.amount))
    : [];

  const { data: voteSupplyEntry } = useTotalSupplyByLedger(
    currentGovernor?.voteTokenAddress,
    proposal?.vote_start,
    currentBlockNumber
  );

  const { data: userVote, refetch: refetchUserVote } = useUserVoteByProposalId(
    currentGovernor?.address,
    proposal?.id
  );

  const { data: votingPowerEntry } = useVotingPowerByLedger(
    currentGovernor?.voteTokenAddress,
    proposal?.vote_start,
    currentBlockNumber
  );
  const votingPower = votingPowerEntry?.entry ?? BigInt(0);

  const [isFullView, setIsFullView] = useState(false);
  const [isVotesModalOpen, setIsVotesModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);

  const quorumInfo = parseQuorumInfo(
    voteSupplyEntry?.entry,
    governorSettings,
    proposal?.vote_count
  );
  const isExecutable =
    proposal &&
    proposal.status === ProposalStatusExt.Successful &&
    proposal.action.tag !== ProposalActionEnum.SNAPSHOT &&
    currentBlockNumber
      ? proposal.eta <= currentBlockNumber
      : false;
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

  const [restoreVoteSim, setRestoreVoteSim] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(votingPowerEntry?.restoreResponse);

  const [restoreProposalStateSim, setRestoreProposalStateSim] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(undefined);

  function handleVote() {
    if (
      selectedSupport !== null &&
      proposal !== undefined &&
      currentGovernor !== undefined
    ) {
      vote(proposal.id, selectedSupport, currentGovernor.address).then(
        (res) => {
          if (isRestoreResponse(res)) {
            setRestoreVoteSim(res);
          } else {
            setRestoreVoteSim(undefined);
          }
          refetch();
          refetchVotes();
          refetchUserVote();
        }
      );
    }
  }

  function handleExecute() {
    if (proposal !== undefined && currentGovernor !== undefined) {
      executeProposal(proposal.id, currentGovernor.address).then((res) => {
        if (isRestoreResponse(res)) {
          setRestoreProposalStateSim(res);
        } else {
          setRestoreProposalStateSim(undefined);
        }
        refetch();
        refetchVotes();
      });
    }
  }

  function handleClose() {
    if (proposal !== undefined && currentGovernor !== undefined) {
      closeProposal(proposal.id, currentGovernor.address).then((res) => {
        if (isRestoreResponse(res)) {
          setRestoreProposalStateSim(res);
        } else {
          setRestoreProposalStateSim(undefined);
        }
        refetch();
        refetchVotes();
      });
    }
  }

  function handleCancel() {
    if (proposal !== undefined && currentGovernor !== undefined) {
      cancelProposal(proposal.id, currentGovernor.address).then((res) => {
        if (isRestoreResponse(res)) {
          setRestoreProposalStateSim(res);
        } else {
          setRestoreProposalStateSim(undefined);
        }
        refetch();
        refetchVotes();
      });
    }
  }

  function handleRestore(
    sim: rpc.Api.SimulateTransactionRestoreResponse | undefined
  ) {
    if (connected && sim !== undefined) {
      restore(sim).then(() => {
        setRestoreVoteSim(undefined);
        setRestoreProposalStateSim(undefined);
        refetch();
        refetchVotes();
      });
    }
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

      {proposal && currentGovernor !== undefined && (
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
              <Typography.Big className="break-words leading-8 sm:leading-[44px]">
                {proposal.title}
              </Typography.Big>
              <Container slim className="flex flex-row justify-between">
                <Container slim>
                  <Typography.Small className="text-snapLink">
                    {currentGovernor.name} by{" "}
                    <Typography.Small className="!text-white font-bold">
                      {shortenAddress(proposal.proposer)}
                    </Typography.Small>
                  </Typography.Small>
                </Container>
                <Container slim className="flex items-center gap-2">
                  {isExecutable && connected && (
                    <RestoreButton
                      onClick={handleExecute}
                      onRestore={() => handleRestore(restoreProposalStateSim)}
                      className={`w-32 !bg-secondary ${
                        isLoading ? "!py-1.5" : ""
                      } `}
                      simResult={restoreProposalStateSim}
                      isLoading={isLoading}
                    >
                      {"Execute"}
                    </RestoreButton>
                  )}
                  {proposal.status === ProposalStatusExt.Open &&
                    currentBlockNumber &&
                    proposal.vote_end < currentBlockNumber &&
                    connected && (
                      <RestoreButton
                        onClick={handleClose}
                        onRestore={() => handleRestore(restoreProposalStateSim)}
                        className={`w-32 !bg-secondary ${
                          isLoading ? "!py-1.5" : ""
                        } `}
                        simResult={restoreProposalStateSim}
                        isLoading={isLoading}
                      >
                        {"Close"}
                      </RestoreButton>
                    )}
                  {proposal?.proposer === walletAddress &&
                    connected &&
                    proposal.status === ProposalStatusExt.Pending && (
                      <RestoreButton
                        onClick={handleCancel}
                        onRestore={() => handleRestore(restoreProposalStateSim)}
                        className={`w-32 !bg-secondary ${
                          isLoading ? "!py-1.5" : ""
                        } `}
                        simResult={restoreProposalStateSim}
                        isLoading={isLoading}
                      >
                        {"Cancel"}
                      </RestoreButton>
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
            )}
            {activeTab === "Action" && (
              <Container>
                <ProposalAction
                  governorSettings={governorSettings as GovernorSettings}
                  action={proposal.action}
                />
              </Container>
            )}
            {proposal.status === ProposalStatusExt.Active && (
              <Container slim>
                <Box>
                  <Container className="border-b border-snapBorder flex !flex-row justify-between ">
                    <Typography.Medium className=" !p-4 flex w-max">
                      {userVote !== undefined
                        ? "Your vote is in"
                        : "Cast your vote"}
                    </Typography.Medium>
                    {connected && (
                      <>
                        <Typography.Medium className=" !p-4 flex w-max text-snapLink ">
                          Proposal voting power:{" "}
                          {toBalance(votingPower, currentGovernor?.decimals)}
                        </Typography.Medium>
                        <Image
                          src="/icons/question-icon.svg"
                          width={20}
                          height={20}
                          className="vote-tooltip"
                          alt="question"
                        />
                        <Tooltip
                          anchorSelect=".vote-tooltip"
                          content="Proposal voting power only includes votes that were acquired before the proposal start ledger. Any votes acquired after the proposal start ledger will be included for future proposals."
                        />
                      </>
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
                    <RestoreButton
                      onClick={() => {
                        if (connected && userVote === undefined) {
                          handleVote();
                        } else {
                          connect();
                        }
                      }}
                      onRestore={() => handleRestore(restoreVoteSim)}
                      className="!bg-secondary px-16 !w-full"
                      disabled={
                        userVote !== undefined ||
                        proposal.status !== ProposalStatusExt.Active ||
                        votingPower === BigInt(0)
                      }
                      simResult={restoreVoteSim}
                      isLoading={isLoading}
                    >
                      {connected ? "Vote" : "Connect Wallet to Vote"}
                    </RestoreButton>
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
                      voteCount={total_votes}
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
                    {currentBlockNumber
                      ? formatDate(
                          getProposalDate(
                            proposal?.vote_start,
                            currentBlockNumber
                          )
                        )
                      : "unknown"}
                  </Typography.Small>
                </Container>
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">
                    End date{" "}
                  </Typography.P>
                  <Typography.Small className="">
                    {currentBlockNumber
                      ? formatDate(
                          getProposalDate(
                            proposal?.vote_end,
                            currentBlockNumber
                          )
                        )
                      : "unknown"}
                  </Typography.Small>
                </Container>
                {proposal.eta > 0 &&
                  (proposal.execution_hash === undefined ||
                    proposal.execution_hash === "") && (
                    <Container className="flex justify-between mb-2">
                      <Typography.P className=" text-snapLink">
                        Execution unlocked{" "}
                      </Typography.P>
                      <Typography.Small className="">
                        {currentBlockNumber
                          ? formatDate(
                              getProposalDate(proposal?.eta, currentBlockNumber)
                            )
                          : "unknown"}
                      </Typography.Small>
                    </Container>
                  )}
                {proposal.eta > 0 &&
                  proposal.execution_hash !== undefined &&
                  proposal.execution_hash !== "" && (
                    <Container className="flex justify-between mb-2">
                      <Typography.P className=" text-snapLink">
                        Executed{" "}
                      </Typography.P>
                      <Typography.Small
                        onClick={() => {
                          window.open(
                            `${process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL}/tx/${proposal.execution_hash}`,
                            "_blank"
                          );
                        }}
                        className="underline cursor-pointer flex flex-row gap-1 items-center"
                      >
                        View
                        <Image
                          src="/icons/external-link.svg"
                          width={20}
                          height={20}
                          alt="link"
                        />
                      </Typography.Small>
                    </Container>
                  )}
                <Container className="flex justify-between mb-2">
                  <Typography.P className=" text-snapLink">ID </Typography.P>
                  <Typography.Small className="">
                    {proposal.id}
                  </Typography.Small>
                </Container>
              </Container>
            </Box>
            {proposal.status !== ProposalStatusExt.Canceled && (
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
                      proposal.status === ProposalStatusExt.Active
                        ? "bg-secondary"
                        : "bg-neutral-200"
                    }
                    endContent={
                      <Container slim>
                        <Typography.P>
                          {proposal.vote_count._for > BigInt(0)
                            ? `${toBalance(
                                proposal.vote_count._for,
                                currentGovernor.decimals
                              )} -`
                            : "   "}
                        </Typography.P>
                        <Typography.P>
                          {" "}
                          {percent_for > 0
                            ? (percent_for * 100).toFixed(2)
                            : "0"}
                          %
                        </Typography.P>
                      </Container>
                    }
                    percentage={percent_for}
                  />{" "}
                  <ProgressBar
                    className="flex flex-col gap-2 mb-4"
                    label="No"
                    barClassName={
                      proposal.status === ProposalStatusExt.Active
                        ? "bg-secondary"
                        : "bg-neutral-200"
                    }
                    endContent={
                      <Container slim>
                        <Typography.P>
                          {proposal.vote_count.against > 0
                            ? `${toBalance(
                                proposal.vote_count.against,
                                currentGovernor.decimals
                              )} -`
                            : "   "}
                        </Typography.P>
                        <Typography.P>
                          {" "}
                          {percent_against > 0
                            ? (percent_against * 100).toFixed(2)
                            : "0"}
                          %
                        </Typography.P>
                      </Container>
                    }
                    percentage={percent_against}
                  />{" "}
                  <ProgressBar
                    className="flex flex-col gap-2 mb-4"
                    label="Abstain"
                    barClassName={
                      proposal.status === ProposalStatusExt.Active
                        ? "bg-secondary"
                        : "bg-neutral-200"
                    }
                    endContent={
                      <Container slim>
                        <Typography.P>
                          {proposal.vote_count.abstain > 0
                            ? `${toBalance(
                                proposal.vote_count.abstain,
                                currentGovernor.decimals
                              )} -`
                            : "   "}
                        </Typography.P>
                        <Typography.P>
                          {" "}
                          {percent_abstain > 0
                            ? (percent_abstain * 100).toFixed(2)
                            : "0"}
                          %
                        </Typography.P>
                      </Container>
                    }
                    percentage={percent_abstain}
                  />{" "}
                  {
                    // quorum info is not stored on chain forever. Only render if we got info.
                    quorumInfo.quorumRequirement != BigInt(0) && (
                      <>
                        <ProgressBar
                          className="flex flex-col gap-2 mb-4"
                          label="Quorum"
                          barClassName={
                            proposal.status === ProposalStatusExt.Active
                              ? "bg-secondary"
                              : "bg-neutral-200"
                          }
                          endContent={
                            <Container
                              slim
                              className="flex flex-row gap-1 items-center"
                            >
                              <Typography.P>
                                {quorumInfo.quorumPercentage < 1
                                  ? `${toBalance(
                                      quorumInfo.quorumVotes,
                                      currentGovernor.decimals
                                    )} / ${toBalance(
                                      quorumInfo.quorumRequirement,
                                      currentGovernor.decimals
                                    )}`
                                  : "Reached"}
                              </Typography.P>
                              {quorumInfo.quorumPercentage >= 1 && (
                                <Image
                                  src="/icons/check.svg"
                                  height={24}
                                  alt="check"
                                  color="green"
                                />
                              )}
                            </Container>
                          }
                          percentage={quorumInfo.quorumPercentage}
                        />{" "}
                      </>
                    )
                  }
                </Container>
              </Box>
            )}
          </Container>
        </Container>
      )}
      {!proposal && isProposalFetched && (
        <Container
          slim
          className="py-2 gap-1 flex flex-row items-center bg-warningOpaque rounded pl-2 mb-2"
        >
          <Image src="/icons/report.svg" width={28} height={28} alt={"close"} />
          <Typography.P className="text-warning">
            {`Unable to load proposal ${params.id} for the governor contract ${
              currentGovernor?.address ?? "UNKNOWN ADDRESS"
            }.\n\n`}
          </Typography.P>
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
              voteCount={total_votes}
            />
          ))}
        </Container>
      </Modal>
    </Container>
  );
}

import { RestoreButton } from "@/components/common/RestoreButton";
import { isRestoreResponse } from "@/utils/stellar";
import { GovernorSettings } from "@script3/soroban-governor-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { GetStaticPaths, GetStaticProps } from "next";
import governors from "../../../public/governors/governors.json";
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
