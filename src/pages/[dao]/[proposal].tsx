import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Chip } from "@/components/common/Chip";
import { Dropdown, Item } from "@/components/common/Dropdown";
import Typography from "@/components/common/Typography";
import { classByStatus } from "@/constants";
import { mockDAOS } from "@/mock/dao";
import { shortenAddress } from "@/utils/shortenAddress";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ThreeDotsSVG } from "../test/comps";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { ViewMore } from "@/components/ViewMore";
import Link from "next/link";
import { formatCompactNumber, formatDate } from "@/utils/date";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Modal } from "@/components/Modal";
import { VoteListItem } from "@/components/VoteListItem";
import { copyToClipboard } from "@/utils/string";
const mockDAO = mockDAOS[0];
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
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isFullView, setIsFullView] = useState(false);
  const [isVotesModalOpen, setIsVotesModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const proposal = mockDAO.proposals[Number(params?.proposal) || 0];
  function handleAction(action: string) {
    switch (action) {
      case "copy":
        copyToClipboard(`${window.location.origin}${pathname}`);
      default:
        console.log("action", action);
        break;
    }
  }
  function handleLinkClick(link: string) {
    window.open(link, "_blank");
  }
  return (
    <Container className="flex flex-col gap-6 ">
      <Container slim className="flex flex-row gap-1 items-end justify-start">
        <Typography.Small
          className="cursor-pointer "
          onClick={() => {
            router.push(`/${mockDAO.name}`);
          }}
        >
          {mockDAO.name}
        </Typography.Small>
        <svg
          viewBox="0 0 24 24"
          width="1.2em"
          height="1.2em"
          className="shrink-0 text-sm stroke-snapLink"
        >
          <path
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m9 5l7 7l-7 7"
          ></path>
        </svg>
        <Typography.Small className=" opacity-40 line-clamp-1 max-w-[380px]">
          {" "}
          {proposal.title}
        </Typography.Small>
      </Container>
      <Container
        slim
        className="flex flex-col px-0 md:px-4 gap-4 mx-auto max-w-[1012px] mt-[20px] w-auto m-auto lg:flex-row "
      >
        <Container slim className="relative  lg:w-8/12 lg:pr-5">
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
                  {mockDAO.name} by{" "}
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
                  buttonText={ThreeDotsSVG}
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
            <Box className="!px-0">
              <Container className="py-4 border-b flex gap-1 border-snapBorder">
                <Typography.P className="inline">Votes </Typography.P>
                <Chip className="!px-1 inline !min-w-[20px] bg-snapLink text-white">
                  {proposal.voteCount.total}
                </Chip>
              </Container>
              {proposal.votes.slice(0, 10).map((vote, index) => (
                <VoteListItem vote={vote} index={index} proposal={proposal} />
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
                  {formatDate(new Date(proposal.vote_start))}
                </Typography.Small>
              </Container>
              <Container className="flex justify-between mb-2">
                <Typography.P className=" text-snapLink">
                  End Date{" "}
                </Typography.P>
                <Typography.Small className="">
                  {formatDate(new Date(proposal.vote_end))}
                </Typography.Small>
              </Container>
              <Container className="flex justify-between mb-2">
                <Typography.P className=" text-snapLink">ID </Typography.P>
                <Typography.Small className="">{proposal.id}</Typography.Small>
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
                        (
                          proposal.voteCount.yes / proposal.voteCount.total
                        ).toFixed(2)
                      ) * 100}
                      %
                    </Typography.P>
                  </>
                }
                progress={
                  Number(
                    (proposal.voteCount.yes / proposal.voteCount.total).toFixed(
                      2
                    )
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
                          proposal.voteCount.no / proposal.voteCount.total
                        ).toFixed(2)
                      ) * 100}
                      %
                    </Typography.P>
                  </>
                }
                progress={
                  Number(
                    (proposal.voteCount.no / proposal.voteCount.total).toFixed(
                      2
                    )
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
                          proposal.voteCount.abstain / proposal.voteCount.total
                        ).toFixed(2)
                      ) * 100}
                      %
                    </Typography.P>
                  </>
                }
                progress={
                  Number(
                    (
                      proposal.voteCount.abstain / proposal.voteCount.total
                    ).toFixed(2)
                  ) * 100
                }
              />{" "}
            </Container>
          </Box>
        </Container>
      </Container>
      <Modal
        isOpen={isVotesModalOpen}
        onClose={() => {
          setIsVotesModalOpen(false);
        }}
        title="Votes"
      >
        <Container slim className="h-max !p-4">
          {proposal.votes.map((vote, index) => (
            <VoteListItem vote={vote} index={index} proposal={proposal} />
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
