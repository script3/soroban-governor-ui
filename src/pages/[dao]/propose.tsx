import { MarkdownPreview } from "@/components/MarkdownPreview";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { Loader } from "@/components/common/Loader";
import MarkdownTextArea from "@/components/common/MarkdownTextArea";
import { RadioButton } from "@/components/common/RadioButton";
import { TextArea } from "@/components/common/TextArea";
import Typography from "@/components/common/Typography";
import { CalldataForm } from "@/components/proposal/CalldataForm";
import ToggleComponent from "@/components/common/Toggle";
import { SettingsForm } from "@/components/proposal/SettingsForm";
import {
  CALLDATA_PLACEHOLDER,
  ProposalActionEnum,
  classByProposalAction,
} from "@/constants";
import { useWallet } from "@/hooks/wallet";
import {
  isCalldata,
  isCalldataString,
  isValidGovernorSettings,
  isAddress,
  parseCallData,
} from "@/utils/validation";
import { parse } from "json5";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Calldata, GovernorSettings } from "@script3/soroban-governor-sdk";

export default function CreateProposal() {
  const router = useRouter();
  const params = router.query;
  const [isPreview, setIsPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formExecutionCalldata, setFormExecutionCalldata] = useState(
    new Calldata("", "", [], [])
  );
  const [jsonExecutionCalldata, setJsonExecutionCalldata] = useState("");
  const [inputStyle, setInputStyle] = useState("Form");
  const [governorSettings, setGovernorSettings] = useState({
    council: "",
    grace_period: 0,
    counting_type: 0,
    proposal_threshold: BigInt(0),
    quorum: 0,
    timelock: 0,
    vote_delay: 0,
    vote_period: 0,
    vote_threshold: 0,
  } as GovernorSettings);
  const [councilAddress, setCouncilAddress] = useState("");
  const [proposalAction, setProposalAction] = useState(
    ProposalActionEnum.CALLDATA
  );
  const [link, setLink] = useState("");
  const { connected, connect, createProposal, isLoading } = useWallet();

  const isCalldataDisabled =
    inputStyle == "Json"
      ? proposalAction === ProposalActionEnum.CALLDATA &&
        (!jsonExecutionCalldata ||
          (!!jsonExecutionCalldata && !isCalldataString(jsonExecutionCalldata)))
      : proposalAction === ProposalActionEnum.CALLDATA &&
        !isCalldata(formExecutionCalldata);

  const isSettingsDisabled =
    proposalAction === ProposalActionEnum.SETTINGS &&
    (!governorSettings ||
      (!!governorSettings && !isValidGovernorSettings(governorSettings)));
  const isCouncilDisabled =
    proposalAction === ProposalActionEnum.COUNCIL &&
    (!councilAddress || !isAddress(councilAddress));

  async function handleProposal(action: string) {
    let newProposalId: bigint | undefined = undefined;
    switch (action) {
      case ProposalActionEnum.CALLDATA:
        const executionCalldata =
          inputStyle === "Json"
            ? (parse(
                jsonExecutionCalldata ||
                  `{
                  args:[],
                  function:"",
                  contract_id:""
                }`
              ) as Calldata)
            : formExecutionCalldata;
        const callDataToPass = parseCallData(executionCalldata);

        if (callDataToPass !== null) {
          newProposalId = await createProposal(
            title,
            description,
            {
              tag: action,
              values: [callDataToPass],
            },
            false,
            params.dao as string
          );
        }
        break;
      case ProposalActionEnum.COUNCIL:
        if (!!councilAddress) {
          newProposalId = await createProposal(
            title,
            description,
            {
              tag: action,
              values: [councilAddress],
            },
            false,
            params.dao as string
          );
        }
        break;
      case ProposalActionEnum.SETTINGS:
        if (!!governorSettings) {
          newProposalId = await createProposal(
            title,
            description,
            {
              tag: action,
              values: [governorSettings],
            },
            false,
            params.dao as string
          );
        }
      case ProposalActionEnum.SNAPSHOT:
        newProposalId = await createProposal(
          title,
          description,
          {
            tag: action,
            values: undefined as any,
          },
          false,
          params.dao as string
        );
    }

    if (!(newProposalId as any).result?.error) {
      router.push(`/${params.dao}/proposals/`);
    }
  }

  return (
    <Container className="flex flex-col lg:flex-row gap-4">
      <div className="flex flex-col w-max lg:w-8/12 lg:pr-5">
        <Typography.P
          onClick={() => {
            router.back();
          }}
          className="text-snapLink  hover:underline cursor-pointer  flex w-max "
        >
          <Image
            src="/icons/back-arrow.svg"
            alt="back"
            width={24}
            height={24}
          />{" "}
          Back
        </Typography.P>

        {!connected && (
          <Box className="flex  border-snapLink  flex-col gap-2 p-6 m-4">
            <Typography.Small className="text-snapLink flex gap-2">
              <Image src="/icons/info.svg" height={18} width={18} alt="info" />{" "}
              You need to connect your wallet in order to submit a proposal.
            </Typography.Small>
            <Typography.Small className="w-max hover:underline cursor-pointer  flex ">
              Learn more
            </Typography.Small>
          </Box>
        )}

        <Container slim className=" flex flex-col gap-0 ">
          <Typography.P className="text-snapLink">Proposal type</Typography.P>
          <RadioButton
            endText="DAO will submit a transaction"
            selected={proposalAction === ProposalActionEnum.CALLDATA}
            onChange={() => {
              setProposalAction(ProposalActionEnum.CALLDATA);
            }}
            label={
              <Chip
                className={`${
                  classByProposalAction[ProposalActionEnum.CALLDATA]
                } !py-4`}
              >
                {ProposalActionEnum.CALLDATA}
              </Chip>
            }
          />
          <RadioButton
            endText="Change the security council of the DAO"
            selected={proposalAction === ProposalActionEnum.COUNCIL}
            onChange={() => {
              setProposalAction(ProposalActionEnum.COUNCIL);
            }}
            label={
              <Chip
                className={`${
                  classByProposalAction[ProposalActionEnum.COUNCIL]
                } !py-4`}
              >
                {ProposalActionEnum.COUNCIL}
              </Chip>
            }
          />
          <RadioButton
            endText="Change the settings of the DAO"
            selected={proposalAction === ProposalActionEnum.SETTINGS}
            onChange={() => {
              setProposalAction(ProposalActionEnum.SETTINGS);
            }}
            label={
              <Chip
                className={`${
                  classByProposalAction[ProposalActionEnum.SETTINGS]
                } !py-4`}
              >
                {ProposalActionEnum.SETTINGS}
              </Chip>
            }
          />
          <RadioButton
            endText="No execution action"
            selected={proposalAction === ProposalActionEnum.SNAPSHOT}
            onChange={() => {
              setProposalAction(ProposalActionEnum.SNAPSHOT);
            }}
            label={
              <Chip
                className={`${
                  classByProposalAction[ProposalActionEnum.SNAPSHOT]
                } !py-4`}
              >
                {ProposalActionEnum.SNAPSHOT}
              </Chip>
            }
          />
        </Container>
        {!isPreview && (
          <>
            <Typography.Small className="text-snapLink !my-2 ">
              Title
            </Typography.Small>
            <Input placeholder="" value={title} onChange={setTitle} />
            <Typography.Small className="text-snapLink !my-2 ">
              Description
            </Typography.Small>
            <MarkdownTextArea
              value={description}
              onChange={setDescription}
              preview={false}
              bodyLimit={20_000}
            />
            {proposalAction === ProposalActionEnum.CALLDATA && (
              <>
                <ToggleComponent
                  value={inputStyle}
                  options={["Form", "Json"]}
                  onChange={setInputStyle}
                />
                {inputStyle === "Json" ? (
                  <TextArea
                    isError={isCalldataDisabled}
                    className="min-h-72"
                    value={jsonExecutionCalldata}
                    onChange={setJsonExecutionCalldata}
                    placeholder={CALLDATA_PLACEHOLDER}
                  />
                ) : (
                  <CalldataForm
                    isAuth={false}
                    calldata={formExecutionCalldata}
                    setCalldata={setFormExecutionCalldata}
                  />
                )}
              </>
            )}
            {proposalAction === ProposalActionEnum.SETTINGS && (
              <>
                <SettingsForm
                  settings={governorSettings}
                  setSettings={setGovernorSettings}
                />
                {isSettingsDisabled && (
                  <Typography.Tiny className="text-red-500">
                    Max proposal lifetime can not exceed 535680 ledgers
                    (Proposal lifetime:{" "}
                    {governorSettings.vote_delay +
                      governorSettings.vote_period +
                      governorSettings.timelock +
                      governorSettings.grace_period * 2}
                    )
                  </Typography.Tiny>
                )}
              </>
            )}
            {proposalAction === ProposalActionEnum.COUNCIL && (
              <>
                <Typography.Small className="text-snapLink !my-2 ">
                  New security council address
                </Typography.Small>
                <Input
                  error={isCouncilDisabled}
                  className=""
                  value={councilAddress}
                  onChange={setCouncilAddress}
                  placeholder={"G... or C..."}
                />
              </>
            )}
          </>
        )}
        {isPreview && (
          <>
            <Typography.Huge className="text-white !my-2 ">
              {title}
            </Typography.Huge>
            <MarkdownPreview body={description} />
            {!!link && (
              <Box className="flex min-h-20 items-center my-2 justify-center gap-2">
                <Link
                  className="flex hover:underline text-lg items-center gap-2"
                  href={link}
                  target="_blank"
                >
                  Discussion link{" "}
                </Link>
                <Typography.Small className="text-snapLink flex ">
                  ({link})
                </Typography.Small>
              </Box>
            )}
          </>
        )}
      </div>

      <div className="flex lg:w-4/12 lg:min-w-[321px]  ">
        <Box className="flex flex-col p-6 my-2 w-full gap-2  lg:w-[320px] lg:fixed">
          <Button
            className=" !w-full"
            onClick={() => {
              setIsPreview(!isPreview);
            }}
            disabled={!title && !description}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            className="!bg-secondary  !w-full"
            disabled={
              connected &&
              (!title ||
                !description ||
                isCalldataDisabled ||
                isSettingsDisabled ||
                isCouncilDisabled)
            }
            onClick={() => {
              if (!!connected) {
                handleProposal(proposalAction);
              } else {
                connect();
              }
            }}
          >
            {isLoading ? (
              <Loader />
            ) : !connected ? (
              "Connect Wallet"
            ) : (
              "Create Proposal"
            )}
          </Button>
        </Box>
      </div>
    </Container>
  );
}

import governors from "../../../public/governors/governors.json";
import { GetStaticPaths, GetStaticProps } from "next";
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
