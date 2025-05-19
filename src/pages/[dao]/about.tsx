import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import Typography from "@/components/common/Typography";
import { toBalance } from "@/utils/formatNumber";
import { useRouter } from "next/router";
import { useGovernor, useGovernorCouncil, useGovernorSettings } from "@/hooks/api";
import governors from "../../../public/governors/governors.json";
import { GetStaticPaths, GetStaticProps } from "next";
import { Loader } from "@/components/common/Loader";
import { Address } from "@stellar/stellar-sdk";
import ReactMarkdown from 'react-markdown';

function About() {
  const router = useRouter();
  const params = router.query;
  const currentGovernor = useGovernor(params.dao as string);
  const { data: settings } = useGovernorSettings(currentGovernor?.address);
  const { data: council } = useGovernorCouncil(
    currentGovernor?.address,
    // TEMP-1: Temp fix until CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV is no longer supported
    currentGovernor !== undefined && currentGovernor.address !== "CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV"
  );

  if (settings == undefined || currentGovernor == undefined) {
    return (
      <Container slim className=" mt-3 flex flex-col gap-6 w-full">
        <Box className="flex flex-col gap-3 p-4 w-full">
          <Typography.Big>Profile</Typography.Big>
          <Typography.P>Name</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor?.name ?? "Loading..."}
          </Typography.Small>
          <Typography.Medium>Settings</Typography.Medium>
          <Container className="pl-2 flex flex-col gap-3">
            <Loader />
          </Container>
        </Box>
      </Container>
    );
  }

  // TEMP-1: Temp fix until CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV is no longer supported
  let resolved_council = currentGovernor?.address !== "CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV" ?
    council : new Address("GBCAS7XIGDRZY4BMABJMGGW7J3YTITRRV5BTEMFQE5ZZSSVWHHX2ZSS4");

  let quorum_vote_types: string[] = [];
  if (settings?.counting_type & 0b100) {
    quorum_vote_types.push("against");
  }
  if (settings?.counting_type & 0b010) {
    quorum_vote_types.push("for");
  }
  if (settings?.counting_type & 0b001) {
    quorum_vote_types.push("abstain");
  }
  return (
    <Container slim className=" mt-3 flex flex-col gap-6 w-full">
      <Box className="flex flex-col gap-3 p-4 w-full">
        <Typography.Big>Profile</Typography.Big>
        <Typography.P>Name</Typography.P>
        <Typography.Small className="text-snapLink pl-2">
          {currentGovernor.name}
        </Typography.Small>
        {currentGovernor.description && (
          <>
            <Typography.P>Description</Typography.P>
            <Typography.Small className="text-snapLink pl-2 markdown">
              <ReactMarkdown>{currentGovernor.description}</ReactMarkdown>
            </Typography.Small>
          </>
        )}
        <Typography.Medium>Settings</Typography.Medium>
        <Container className="pl-2 flex flex-col gap-3">
          <Typography.P>Council</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {resolved_council ? resolved_council.toString() : "Unknown"}
          </Typography.Small>
          <Typography.P>Counting Type</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`Quorum includes votes: ${quorum_vote_types.join(", ")}`}
          </Typography.Small>
          <Typography.P>Grace Period</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${settings.grace_period} ledgers`}
          </Typography.Small>
          <Typography.P>Proposal Threshold</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${toBalance(settings.proposal_threshold, currentGovernor.decimals)} ${currentGovernor.voteTokenMetadata?.symbol}`}
          </Typography.Small>
          <Typography.P>Quorum</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${settings.quorum / 100}%`}
          </Typography.Small>
          <Typography.P>Timelock</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${settings.timelock} ledgers`}
          </Typography.Small>
          <Typography.P>Vote Delay</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${settings.vote_delay} ledgers`}
          </Typography.Small>
          <Typography.P>Vote Period</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${settings.vote_period} ledgers`}
          </Typography.Small>
          <Typography.P>Vote Threshold</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {`${settings.vote_threshold / 100}%`}
          </Typography.Small>
        </Container>
      </Box>
    </Container>
  );
}

About.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default About;

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
