import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import Typography from "@/components/common/Typography";
import { toBalance } from "@/utils/formatNumber";
import { useRouter } from "next/router";
import { useGovernor } from "@/hooks/api";

function About() {
  const router = useRouter();
  const params = router.query;
  const { governor: currentGovernor } = useGovernor(params.dao as string, {
    placeholderData: {},
    enabled: !!params.dao,
  });

  let settings = currentGovernor?.settings;
  if (settings == undefined) {
    return (
      <Container slim className=" mt-3 flex flex-col gap-6 w-full">
        <Box className="flex flex-col gap-3 p-4 w-full">
          <Typography.Big>Profile</Typography.Big>
          <Typography.P>Name</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.name}
          </Typography.Small>
          <Typography.Medium>Settings</Typography.Medium>
          <Container className="pl-2 flex flex-col gap-3">
            <Loader />
          </Container>
        </Box>
      </Container>
    );
  }

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
        <Typography.Medium>Settings</Typography.Medium>
        <Container className="pl-2 flex flex-col gap-3">
          <Typography.P>Council</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {settings.council}
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

import governors from "../../../public/governors/governors.json";
import { GetStaticPaths, GetStaticProps } from "next";
import { Loader } from "@/components/common/Loader";
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
