import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";

import Typography from "@/components/common/Typography";
import { ProposalActionEnum } from "@/constants";
import { Calldata, GovernorSettings, type ProposalAction } from "@script3/soroban-governor-sdk";
import { stringify } from "json5";
import Image from "next/image";
import { DisplayCalldata } from "./DisplayCalldata";

export function ProposalAction({
  action,
  governorSettings,
}: {
  action: ProposalAction;
  governorSettings: GovernorSettings;
}) {
  const proposalType = action.tag;

  switch (proposalType) {
    case ProposalActionEnum.CALLDATA:
      const calldata = action.values as any as Calldata;

      return <DisplayCalldata calldata={calldata} />;
    case ProposalActionEnum.UPGRADE:
      return (
        <Container className="flex flex-col gap-3">
          <Typography.P className="mb-2">Proposed WASM hash:</Typography.P>
          <Box className="p-4 box-border">
            <code className="whitespace-pre-wrap word-break p-1 ">
              {(action.values as any).toString("hex")}
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
          <Box className="p-4 box-border">
            <code className="whitespace-pre-wrap word-break p-1 ">
              {stringify(governorSettings, null, 8)}
            </code>
          </Box>
          <Typography.P className="mb-2">
            Proposed settings object:
          </Typography.P>
          <Box className="p-4 box-border">
            <code className="whitespace-pre-wrap word-break p-1 ">
              {stringify(action?.values, null, 8)}
            </code>
          </Box>
        </Container>
      );
    case ProposalActionEnum.COUNCIL:
      return (
        <Container className="flex flex-col gap-3">
          <Typography.P className="mb-2">
            Proposed security council:
          </Typography.P>
          <Box className="p-4 box-border">
            <code className="whitespace-pre-wrap word-break p-1 ">
              {action.values}
            </code>
          </Box>
        </Container>
      );
  }
}
