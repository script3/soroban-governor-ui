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
import ToggleComponent from "@/components/common/Toggle";
import Typography from "@/components/common/Typography";
import { CalldataForm } from "@/components/proposal/CalldataForm";
import { SettingsForm } from "@/components/proposal/SettingsForm";
import {
  CALLDATA_PLACEHOLDER,
  ProposalActionEnum,
  classByProposalAction,
} from "@/constants";
import { useGovernor } from "@/hooks/api";
import {
  RPC_DEBOUNCE_DELAY,
  useDebouncedState,
} from "@/hooks/useDebouncedState";
import { useWallet } from "@/hooks/wallet";
import {
  jsonReplacer,
  parseErrorFromSimError,
  parseResultFromXDRString,
} from "@/utils/stellar";
import {
  isAddress,
  isCalldata,
  isCalldataString,
  isMaxTimeExceeded,
  isValidGovernorSettings,
  parseCallData,
} from "@/utils/validation";
import {
  Calldata,
  GovernorSettings,
  calldataToAuthInvocation,
  valToScVal,
} from "@script3/soroban-governor-sdk";
import {
  Account,
  Address,
  Contract,
  TransactionBuilder,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { parse, stringify } from "json5";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import governors from "../../../public/governors/governors.json";

const TYPE_FORM = "Form";
const TYPE_JSON = "Json";

export default function CreateProposal() {
  const router = useRouter();
  const params = router.query;
  let { network, connected, connect, createProposal, isLoading } = useWallet();
  const [isPreview, setIsPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [calldata, setCalldata] = useState<Calldata | undefined>(undefined);
  const [jsonCalldata, setJsonCalldata] = useState("");
  const [inputStyle, setInputStyle] = useState<string>(TYPE_FORM);

  const [calldataSimSuccess, setCalldataSimSuccess] = useState<boolean>(false);
  const [calldataSimResult, setCalldataSimResult] = useState<string>("");
  const [calldataAuthSuccess, setCalldataAuthSuccess] =
    useState<boolean>(false);
  const [callAuthResult, setCalldataAuthResult] = useState<string>("");

  useDebouncedState(calldata, RPC_DEBOUNCE_DELAY, handleSimCalldata);

  const [governorSettings, setGovernorSettings] = useState<GovernorSettings>({
    grace_period: 0,
    counting_type: 0,
    proposal_threshold: BigInt(0),
    quorum: 0,
    timelock: 0,
    vote_delay: 0,
    vote_period: 0,
    vote_threshold: 0,
  });
  const [councilAddress, setCouncilAddress] = useState("");
  const [proposalAction, setProposalAction] = useState(
    ProposalActionEnum.CALLDATA
  );

  const currentGovernor = useGovernor(params.dao as string);

  const isCalldataDisabled =
    proposalAction === ProposalActionEnum.CALLDATA &&
    (!isCalldata(calldata) ||
      !isCalldataString(jsonCalldata) ||
      !calldataSimSuccess);
  const isSettingsDisabled =
    proposalAction === ProposalActionEnum.SETTINGS &&
    (!governorSettings ||
      (!!governorSettings && !isValidGovernorSettings(governorSettings)));
  const isCouncilDisabled =
    proposalAction === ProposalActionEnum.COUNCIL &&
    (!councilAddress || !isAddress(councilAddress));

  function handleSetCalldataString(calldataString: string) {
    setJsonCalldata(calldataString);
    if (isCalldataString(calldataString)) {
      const calldataObj = parse(calldataString) as Calldata;
      setCalldata(calldataObj);
    }
  }

  function handleSetCalldata(calldataObj: Calldata) {
    setCalldata(calldataObj);
    setJsonCalldata(stringify(calldataObj, null, 2));
  }

  async function handleProposal(action: string) {
    let newProposalId;
    switch (action) {
      case ProposalActionEnum.CALLDATA:
        const callDataToPass = parseCallData(calldata);

        if (callDataToPass !== null) {
          newProposalId = await createProposal(
            title,
            description,
            {
              tag: action,
              values: [callDataToPass],
            },
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
          params.dao as string
        );
    }

    if (
      newProposalId !== undefined &&
      "status" in newProposalId &&
      newProposalId.status === rpc.Api.GetTransactionStatus.SUCCESS
    ) {
      router.push(`/${params.dao}/proposals/`);
    }
  }

  async function handleSimCalldata(calldata: Calldata) {
    try {
      if (isCalldata(calldata)) {
        let account = new Account(
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
          "1"
        );
        let tx = new TransactionBuilder(account, {
          fee: "1000",
          timebounds: {
            minTime: 0,
            maxTime: 0,
          },
          networkPassphrase: network.passphrase,
        })
          .addOperation(
            new Contract(calldata.contract_id).call(
              calldata.function,
              ...calldata.args.map((arg) =>
                xdr.ScVal.fromXDR(valToScVal(arg).toXDR())
              )
            )
          )
          .build();
        let server = new rpc.Server(network.rpc, network.opts);
        let result = await server.simulateTransaction(tx);
        if (rpc.Api.isSimulationSuccess(result)) {
          // attempt to validate that the auth is OK for the Governor by validating the authorization entry
          // returned by the simulation
          let validAuths = true;
          let authResult = "No authorizations required.";
          try {
            if (currentGovernor !== undefined) {
              let governor_sc_address_xdr = new Address(currentGovernor.address)
                .toScAddress()
                .toXDR("base64");
              let contract_auth = result.result?.auth?.find(
                (auth) =>
                  auth.credentials().address().address().toXDR("base64") ===
                  governor_sc_address_xdr
              );
              if (contract_auth !== undefined) {
                let auth_invocation_xdr = contract_auth
                  .rootInvocation()
                  .toXDR("base64");
                let calldata_invocation_xdr =
                  calldataToAuthInvocation(calldata).toXDR("base64");
                if (auth_invocation_xdr !== calldata_invocation_xdr) {
                  validAuths = false;
                  authResult = `Soroban authorized invocation does not match calldata. Expected: ${auth_invocation_xdr}`;
                } else {
                  validAuths = true;
                  authResult = `Validated calldata authorizations.`;
                }
              }
            }
          } catch (e) {
            validAuths = false;
            authResult = `Auth was unable to be validate.`;
          }
          setCalldataAuthSuccess(validAuths);
          setCalldataAuthResult(authResult);
          let retval_xdr = result.result?.retval?.toXDR("base64");
          let retval: any = "";
          if (retval_xdr && retval_xdr !== "AAAAAQ==") {
            retval = parseResultFromXDRString(retval_xdr);
          }
          setCalldataSimSuccess(true);
          setCalldataSimResult(
            `Successfully simulated. ${
              retval === ""
                ? "No return value detected."
                : `Return Value: \n ${JSON.stringify(retval, jsonReplacer, 2)}`
            }`
          );
        } else if (rpc.Api.isSimulationRestore(result)) {
          setCalldataSimSuccess(false);
          setCalldataSimResult(`Simulation hit expired ledger entries.`);
          setCalldataAuthSuccess(false);
          setCalldataAuthResult("");
        } else {
          setCalldataSimSuccess(false);
          setCalldataSimResult(
            `Simulation failed: ${parseErrorFromSimError(result.error)}`
          );
          setCalldataAuthSuccess(false);
          setCalldataAuthResult("");
        }
      } else {
        setCalldataSimSuccess(false);
        setCalldataSimResult("");
        setCalldataAuthSuccess(false);
        setCalldataAuthResult("");
      }
    } catch (e: any) {
      setCalldataSimSuccess(false);
      setCalldataSimResult("Failed to build transaction");
      setCalldataAuthSuccess(false);
      setCalldataAuthResult("");
      console.error(e);
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
                  options={[TYPE_FORM, TYPE_JSON]}
                  onChange={setInputStyle}
                />
                {inputStyle === TYPE_JSON ? (
                  <TextArea
                    isError={isCalldataDisabled}
                    className="min-h-72"
                    value={jsonCalldata}
                    onChange={handleSetCalldataString}
                    placeholder={CALLDATA_PLACEHOLDER}
                  />
                ) : (
                  <CalldataForm
                    isAuth={false}
                    calldata={
                      calldata ?? {
                        contract_id: "",
                        function: "",
                        args: [],
                        auths: [],
                      }
                    }
                    onChange={handleSetCalldata}
                  />
                )}
                {calldataAuthSuccess ? (
                  <Typography.Small className="text-green-500 mt-4 whitespace-normal break-all">
                    {callAuthResult}
                  </Typography.Small>
                ) : (
                  <Typography.Small className="text-red-500 mt-4 whitespace-normal break-all">
                    {callAuthResult}
                  </Typography.Small>
                )}
                {calldataSimSuccess ? (
                  <Typography.Small className="text-green-500 mt-4 whitespace-pre-wrap break-all">
                    {calldataSimResult}
                  </Typography.Small>
                ) : (
                  <Typography.Small className="text-red-500 mt-4 whitespace-pre-wrap break-all">
                    {calldataSimResult}
                  </Typography.Small>
                )}
              </>
            )}
            {proposalAction === ProposalActionEnum.SETTINGS && (
              <>
                <SettingsForm
                  settings={governorSettings}
                  setSettings={setGovernorSettings}
                />
                {isSettingsDisabled && isMaxTimeExceeded(governorSettings) && (
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
