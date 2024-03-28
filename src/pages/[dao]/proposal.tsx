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
import {
  CALLDATA_PLACEHOLDER,
  GOVERNOR_SETTINGS_PLACEHOLDER,
  ProposalActionEnum,
  classByProposalAction,
} from "@/constants";
import { useWallet } from "@/hooks/wallet";
import {
  isCalldataString,
  isGovernorSettingsString,
  isUpgradeString,
  parseCallData,
} from "@/utils/validation";
import { parse } from "json5";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Calldata, GovernorSettings, Val } from "soroban-governor-js-sdk";

export default function CreateProposal() {
  const router = useRouter();
  const params = router.query;
  const [isPreview, setIsPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [executionCalldata, setExecutionCalldata] = useState("");
  const [governorSettings, setGovernorSettings] = useState("");
  const [upgradeString, setUpgradeString] = useState("");
  const [proposalAction, setProposalAction] = useState(
    ProposalActionEnum.CALLDATA
  );
  const [link, setLink] = useState("");
  const { connected, connect, createProposal, isLoading } = useWallet();

  const isCalldataDisabled =
    proposalAction === ProposalActionEnum.CALLDATA &&
    (!executionCalldata ||
      (!!executionCalldata && !isCalldataString(executionCalldata)));
  const isSettingsDisabled =
    proposalAction === ProposalActionEnum.SETTINGS &&
    (!governorSettings ||
      (!!governorSettings && !isGovernorSettingsString(governorSettings)));
  const isUpgradeDisabled =
    proposalAction === ProposalActionEnum.UPGRADE &&
    (!upgradeString || !isUpgradeString(upgradeString, 32));

  function handleProposal(action: string) {
    switch (action) {
      case ProposalActionEnum.CALLDATA:
        const calldata = parse(
          executionCalldata ||
            `{
              args:[],
              function:"",
              contract_id:""
        
            }`
        ) as Calldata;

        const callDataToPass = parseCallData(calldata);

        if (callDataToPass !== null) {
          createProposal(
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
      case ProposalActionEnum.UPGRADE:
        if (!!upgradeString) {
          createProposal(
            title,
            description,
            {
              tag: action,
              values: [Buffer.from(upgradeString)],
            },
            false,
            params.dao as string
          );
        }

        break;

      case ProposalActionEnum.SETTINGS:
        if (!!governorSettings) {
          const governorToPass = parse(governorSettings) as GovernorSettings;
          createProposal(
            title,
            description,
            {
              tag: action,
              values: [governorToPass],
            },
            false,
            params.dao as string
          );
        }

      case ProposalActionEnum.SNAPSHOT:
        createProposal(
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
            endText="Change the contract code of the DAO"
            selected={proposalAction === ProposalActionEnum.UPGRADE}
            onChange={() => {
              setProposalAction(ProposalActionEnum.UPGRADE);
            }}
            label={
              <Chip
                className={`${
                  classByProposalAction[ProposalActionEnum.UPGRADE]
                } !py-4`}
              >
                {ProposalActionEnum.UPGRADE}
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
                <Typography.Small className="text-snapLink !my-2 ">
                  Execution Calldata
                </Typography.Small>
                <TextArea
                  isError={isCalldataDisabled}
                  className="min-h-72"
                  value={executionCalldata}
                  onChange={setExecutionCalldata}
                  placeholder={CALLDATA_PLACEHOLDER}
                />
              </>
            )}
            {proposalAction === ProposalActionEnum.SETTINGS && (
              <>
                <Typography.Small className="text-snapLink !my-2 ">
                  Governor Settings
                </Typography.Small>
                <TextArea
                  isError={isSettingsDisabled}
                  className="min-h-72"
                  value={governorSettings}
                  onChange={setGovernorSettings}
                  placeholder={GOVERNOR_SETTINGS_PLACEHOLDER}
                />
              </>
            )}
            {proposalAction === ProposalActionEnum.UPGRADE && (
              <>
                <Typography.Small className="text-snapLink !my-2 ">
                  Upgrade to WASM hash
                </Typography.Small>
                <Input
                  error={isUpgradeDisabled}
                  className=""
                  value={upgradeString}
                  onChange={setUpgradeString}
                  placeholder={"WASM hash"}
                />
              </>
            )}

            {/* <Typography.Small className="text-snapLink !my-2 ">
              Discussion (optional)
            </Typography.Small>
            <Input
              placeholder="https://forum.balancer.fi/proposal"
              type="url"
              value={link}
              onChange={setLink}
            /> */}
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
                isUpgradeDisabled)
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
