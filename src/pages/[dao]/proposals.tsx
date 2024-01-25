import DAOLayout from "@/components/Layout/dao/layout";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { ProgressWrapper } from "@/components/common/ProgressWrapper";
import Typography from "@/components/common/Typography";
import { classByStatus } from "@/constants";
import { mockDAOS } from "@/mock/dao";
import { getRelativeProposalPeriod } from "@/utils/date";
import { shortenAddress } from "@/utils/shortenAddress";
import { useState } from "react";
const mockDAO = mockDAOS[0];
function Proposals() {
  const [searchValue, setSearchValue] = useState<string>("");
  return (
    <>
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
            console.log("clicked new proposal button");
          }}
          className="px-6 !w-full  md:!w-40 active:!opacity-90  "
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
              <div className="flex flex-col gap-2">
                {/* votes progress bar */}
                <ProgressWrapper
                  percentage={proposal.voteCount.yes / proposal.voteCount.total}
                >
                  <div className="flex justify-between w-full">
                    <Typography.Medium>Yes</Typography.Medium>
                    <Typography.Medium>
                      {`${(
                        (proposal.voteCount.yes / proposal.voteCount.total) *
                        100
                      ).toFixed(2)}%`}
                    </Typography.Medium>
                  </div>
                </ProgressWrapper>
                <ProgressWrapper
                  percentage={proposal.voteCount.no / proposal.voteCount.total}
                >
                  <div className="flex justify-between w-full">
                    <Typography.Medium>No</Typography.Medium>
                    <Typography.Medium>
                      {`${(
                        (proposal.voteCount.no / proposal.voteCount.total) *
                        100
                      ).toFixed(2)}%`}
                    </Typography.Medium>
                  </div>
                </ProgressWrapper>
                <ProgressWrapper
                  percentage={
                    proposal.voteCount.abstain / proposal.voteCount.total
                  }
                >
                  <div className="flex justify-between w-full">
                    <Typography.Medium>Abstain</Typography.Medium>
                    <Typography.Medium>
                      {`${(
                        (proposal.voteCount.abstain /
                          proposal.voteCount.total) *
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
    </>
  );
}

Proposals.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default Proposals;
