import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import Typography from "@/components/common/Typography";
import { useState } from "react";
import { useRouter } from "next/router";
import { useGovernor } from "@/hooks/api";

function About() {
  const router = useRouter();
  const params = router.query;
  const { governor: currentGovernor } = useGovernor(params.dao as string, {
    placeholderData: {},
    enabled: !!params.dao,
  });

  return (
    <Container slim className=" mt-3 flex flex-col gap-6 w-full">
      <Box className="flex flex-col gap-3 p-4 w-full">
        <Typography.Big>Profile</Typography.Big>
        {/*<Typography.P>Avatar</Typography.P>
         <div className="flex w-full">
          <Image
            className="rounded-full object-cover"
            src={currentGovernor?.logo || "/icons/dao.svg"}
            alt="project image"
            width={64}
            height={64}
          />

        </div> */}
        <Typography.P>Name</Typography.P>
        <Typography.Small className="text-snapLink pl-2">
          {currentGovernor.name}
        </Typography.Small>
        <Typography.Medium>Settings</Typography.Medium>
        <Container className="pl-2 flex flex-col gap-3">
          <Typography.P>Council</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.council}
          </Typography.Small>
          <Typography.P>Counting Type</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.counting_type}
          </Typography.Small>

          <Typography.P>Grace Period</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.grace_period}
          </Typography.Small>
          <Typography.P>Proposal Threshold</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {Number(currentGovernor.settings.proposal_threshold)}
          </Typography.Small>
          <Typography.P>Quorum</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.quorum}
          </Typography.Small>
          <Typography.P>Timelock</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.timelock}
          </Typography.Small>
          <Typography.P>Vote Delay</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.vote_delay}
          </Typography.Small>
          <Typography.P>Vote Period</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.vote_period}
          </Typography.Small>
          <Typography.P>Vote Threshold</Typography.P>
          <Typography.Small className="text-snapLink pl-2">
            {currentGovernor.settings.vote_threshold}
          </Typography.Small>
        </Container>
      </Box>
      {/* <Box className="p-2">
        <Typography.Big>Social</Typography.Big>
        <div className="flex gap-3 justify-between p-4 ">
          <div className="flex flex-col justify-left">
            <Typography.Tiny className="text-snapLink">Twitter</Typography.Tiny>
          </div>
          <div className="flex flex-col justify-left">
            <Typography.Tiny className="text-snapLink">Github</Typography.Tiny>
          </div>
          <div className="flex flex-col justify-left">
            <Typography.Tiny className="text-snapLink">
              CoinGecko
            </Typography.Tiny>
          </div>
        </div>
      </Box> */}
    </Container>
  );
}

About.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default About;
