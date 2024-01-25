import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { TabBar, TabItem } from "@/components/common/Tab/TabBar";
import Typography from "@/components/common/Typography";
import { FlagIcon } from "@/components/common/icons/Flag";
import { classByStatus } from "@/constants";
import { useBreakpoints } from "@/hooks/breakpoints";
import { mockDAOS } from "@/mock/dao";
import { getRelativeProposalPeriod } from "@/utils/date";
import { shortenAddress } from "@/utils/shortenAddress";
import Image from "next/image";
import { useState } from "react";

const mockDAO = mockDAOS[0];

const Tabs: TabItem[] = [
  {
    name: "Proposals",
    route: "/dao/proposals",
  },
  {
    name: "About",
    route: "/dao/about",
  },
  {
    name: "Overview",
    route: "/dao/settings",
  },
];

export default function DAOPage() {
  const [activeTab, setActiveTab] = useState<string>("Proposals");
  const [searchValue, setSearchValue] = useState<string>("");
  const {
    breakpoints: { lg: isLg },
  } = useBreakpoints();
  return (
    <Container className="pt-4 flex flex-col lg:flex-row">
      <Container className="flex flex-col  lg:w-80 min-w-80">
        <Box className="flex flex-col w-full py-3">
          <div className="w-full mb-2">
            <img
              className="rounded-full object-cover"
              src={mockDAO.logo}
              alt="project image"
              width={64}
              height={64}
            />
          </div>
          <div className="w-full">
            <Typography.Huge>{mockDAO.name}</Typography.Huge>
          </div>
          <div className="flex w-full justify-between lg:flex-col lg:w-full gap-4">
            <Typography.Medium className="text-snapLink">
              {` ${mockDAO.memberCount} members `}
            </Typography.Medium>
            <div className="flex gap-2 items-center lg:flex-col lg:w-full">
              <Button
                className="px-8 !bg-primary  active:!opacity-90  lg:!w-full"
                onClick={() => {
                  console.log("clicked join button");
                }}
              >
                Join
              </Button>
              <Button
                onClick={() => {
                  console.log("report clicked ");
                }}
                className="group text-snapLink hover:text-white  active:text-white flex gap-2 lg:!w-full"
              >
                <FlagIcon className="group-hover:stroke-white" /> Report
              </Button>
            </div>
          </div>
          <div className="flex ">
            <TabBar
              tabs={Tabs}
              onClick={({ name }) => {
                setActiveTab(name);
              }}
              activeTabName={activeTab}
              className="lg:flex-col lg:justify-start lg:text-left lg:items-baseline lg:mt-3"
              position={isLg ? "left" : "bottom"}
            />
          </div>
        </Box>
      </Container>
      <Container className="flex flex-col w-auto min-w-[50%] max-w-[75%]">
        <Container className="flex justify-between items-center  flex-wrap py-6">
          <Typography.Huge className="hidden lg:block text-white w-full mb-4">
            Proposals
          </Typography.Huge>
          <div className="flex w-1/3">
            <Input
              value={searchValue}
              placeholder="search for DAOs"
              onChange={setSearchValue}
            />
          </div>

          <Button
            onClick={() => {
              console.log("clicked new proposal button");
            }}
            className="px-8  active:!opacity-90  "
          >
            New proposal
          </Button>
        </Container>
        {/* proposals  */}
        <Container className="flex flex-col gap-4">
          {mockDAO.proposals.map((proposal) => (
            <Box key={proposal.id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Typography.Small className="font-bold">
                  {shortenAddress(proposal.proposer)}
                </Typography.Small>
                <Chip className={classByStatus[proposal.status]}>
                  {proposal.status}
                </Chip>
              </div>
              <div className="flex flex-col gap-3">
                <Typography.Medium className="font-semibold">
                  {proposal.title}
                </Typography.Medium>
                <Typography.P className="line-clamp-2 break-words text-md ">
                  {proposal.description}
                </Typography.P>
                <div className="flex flex-col">{/* votes progress bar */}</div>
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
    </Container>
  );
}
