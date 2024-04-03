import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";

import Typography from "@/components/common/Typography";
import { ProposalActionEnum } from "@/constants";
import { Governor, Proposal } from "@/types";
import { Calldata } from "@script3/soroban-governor-sdk";
import { stringify } from "json5";
import Image from "next/image";

export function ProposalAction({
  proposal,
  governor,
}: {
  proposal: Proposal;
  governor?: Governor;
}) {
  const proposalType = proposal.action.tag;

  switch (proposalType) {
    case ProposalActionEnum.CALLDATA:
      const calldata = proposal.action.values as any as Calldata;
      return (
        <Container className="flex flex-col gap-3">
          <Typography.P className="mb-2">Arguments:</Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap !p-0 leading-7 text-left justify-start ">
              {calldata.args.join("\n")}
            </code>
          </Box>
          <Typography.P className="mb-2">Auths:</Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap !p-0 ">
              {"[" + calldata.auths.join(",\n") + "]"}
            </code>
          </Box>
          <Typography.P className="mb-2">Contract ID:</Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap p-1 ">
              {calldata.contract_id}
            </code>
          </Box>
          <Typography.P className="mb-2">Function:</Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap p-1 ">
              {calldata.function}
            </code>
          </Box>
        </Container>
      );
    case ProposalActionEnum.UPGRADE:
      return (
        <Container className="flex flex-col gap-3">
          <Typography.P className="mb-2">Proposed WASM hash:</Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap p-1 ">
              {(proposal.action.values as any).toString("hex")}
            </code>
          </Box>
        </Container>
      );
    case ProposalActionEnum.SNAPSHOT:
      return (
        <Box className="flex  border-snapLink  flex-col gap-2 p-6 m-4">
          <Typography.Small className="text-snapLink flex gap-2">
            <Image src="/icons/info.svg" height={18} width={18} alt="info" />{" "}
            Disclaimer
          </Typography.Small>
          <Typography.Small className="w-max hover:underline cursor-pointer text-snapLink flex ">
            This proposal type (snapshot) has no action.
          </Typography.Small>
        </Box>
      );
    case ProposalActionEnum.SETTINGS:
      return (
        <Container className="flex flex-col gap-3">
          <Typography.P className="mb-2">Current settings object:</Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap p-1 ">
              {stringify(governor?.settings, null, 8)}
            </code>
          </Box>
          <Typography.P className="mb-2">
            Proposed settings object:
          </Typography.P>
          <Box className="p-4">
            <code className="whitespace-pre-wrap p-1 ">
              {stringify(proposal.action?.values, null, 8)}
            </code>
          </Box>
        </Container>
      );
  }
}
