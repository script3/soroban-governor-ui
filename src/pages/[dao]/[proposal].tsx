import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Chip } from "@/components/common/Chip";
import { Dropdown, Item } from "@/components/common/Dropdown";
import Typography from "@/components/common/Typography";
import { classByStatus } from "@/constants";
import { mockDAOS } from "@/mock/dao";
import { shortenAddress } from "@/utils/shortenAddress";
import { useParams, useRouter } from "next/navigation";
import { ThreeDotsSVG } from "../test/comps";

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
  const proposal = mockDAO.proposals[Number(params?.proposal) || 0];
  function handleAction(action: string) {
    console.log({ action });
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
        className="flex flex-col px-0 md:px-4 mx-auto max-w-[1012px] mt-[20px] w-auto m-auto lg:flex-row "
      >
        <Container slim className="relative  lg:w-8/12 lg:pr-5">
          <Container slim className="flex flex-col">
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
          <Container slim>Proposal Content with view more</Container>
          <Container slim>Discusion</Container>
          <Container slim>Votes</Container>
        </Container>
        <Container slim className="w-full lg:w-4/12 lg:min-w-[321px]">
          <Box>
            <Typography.Big>Information</Typography.Big>
          </Box>
          <Box>
            <Typography.Big>Results</Typography.Big>
          </Box>
        </Container>
      </Container>
    </Container>
  );
}
