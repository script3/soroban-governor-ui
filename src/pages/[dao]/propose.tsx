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
  isPreAuthCalldataString,
  isValidGovernorSettings,
  parseCallData,
} from "@/utils/validation";
import {
  Calldata,
  GovernorSettings,
  authInvocationToCalldata,
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
import { compareCalldataArrays } from "@/utils/calldata";

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
  const [jsonPreAuthCalldata, setJsonPreAuthCalldata] = useState("");
  const [useManualPreAuth, setUseManualPreAuth] = useState<boolean>(false);
  const [callDataPreAuth, setCallDataPreAuth] = useState<Calldata[]>([]);

  const [inputStyle, setInputStyle] = useState<string>(TYPE_FORM);

  const [calldataSimSuccess, setCalldataSimSuccess] = useState<boolean>(false);
  const [calldataSimResult, setCalldataSimResult] = useState<string>("");
  const [simulatedCallDataAuth, setSimulatedCallDataAuth] = useState<
    Calldata[] | undefined
  >(undefined);
  const [isValidCalldata, setIsValidCalldata] = useState<boolean>(false);
  const [allowFailedSimulation, setAllowFailedSimulation] =
    useState<boolean>(false);

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
      !calldataSimSuccess) &&
    !allowFailedSimulation;
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
      const calldataObj = parse<Calldata>(calldataString);
      calldataObj.auths = [];
      setCalldata(calldataObj);
    }
  }

  function handleSetCalldata(calldataObj: Calldata) {
    setCalldata(calldataObj);
    setJsonCalldata(
      stringify(
        {
          contract_id: calldataObj.contract_id,
          function: calldataObj.function,
          args: calldataObj.args,
        },
        null,
        2
      )
    );
  }

  function handleSetPreAuthCalldataString(calldataString: string) {
    setJsonPreAuthCalldata(calldataString);
    if (isPreAuthCalldataString(calldataString)) {
      const calldataObj = parse<Calldata[]>(calldataString);
      setCallDataPreAuth(calldataObj);
    }
  }

  function handleAddAuth() {
    const newAuths = [
      ...callDataPreAuth,
      { contract_id: "", function: "", args: [], auths: [] },
    ];
    setJsonPreAuthCalldata(stringify(newAuths, null, 2));
    setCallDataPreAuth(newAuths);
  }

  function handleRemoveAuth() {
    let newAuths = callDataPreAuth.slice(0, callDataPreAuth.length - 1);
    setCallDataPreAuth(newAuths);
    setJsonPreAuthCalldata(stringify(newAuths, null, 2));
  }

  function handleAuthChange(index: number, newAuth: Calldata) {
    const newAuths: Calldata[] = [...callDataPreAuth];
    newAuths[index] = newAuth;
    setCallDataPreAuth(newAuths);
    setJsonPreAuthCalldata(stringify(newAuths, null, 2));
  }

  async function handleProposal(action: string) {
    let newProposalId;
    switch (action) {
      case ProposalActionEnum.CALLDATA:
        const callDataToPass = parseCallData(calldata);

        if (callDataToPass !== null) {
          if (useManualPreAuth) {
            callDataToPass.auths = callDataPreAuth;
          } else {
            callDataToPass.auths = simulatedCallDataAuth ?? [];
          }
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
        setIsValidCalldata(true);
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
          // Set required auths from simulation
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
                let simContractAuth = contract_auth
                  .rootInvocation()
                  .subInvocations();
                const authFromSim: Calldata[] = simContractAuth.map((auth) =>
                  authInvocationToCalldata(auth.toXDR("base64"))
                );
                setSimulatedCallDataAuth(authFromSim);
              } else {
                setSimulatedCallDataAuth([]);
              }
            }
          } catch (e) {
            console.error("Failed to simulate calldata execution", e);
          }

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
          setSimulatedCallDataAuth(undefined);
        } else {
          setCalldataSimSuccess(false);
          setCalldataSimResult(
            `Simulation failed: ${parseErrorFromSimError(result.error)}`
          );
          setSimulatedCallDataAuth(undefined);
        }
      } else {
        setIsValidCalldata(false);
        setCalldataSimSuccess(false);
        setCalldataSimResult("");
        setSimulatedCallDataAuth(undefined);
      }
    } catch (e: any) {
      setCalldataSimSuccess(false);
      setCalldataSimResult("Failed to build transaction");
      setSimulatedCallDataAuth(undefined);
      console.error(e);
    }
  }

  function handleToggleManualPreAuth() {
    setUseManualPreAuth(!useManualPreAuth);
    setCallDataPreAuth(simulatedCallDataAuth ?? []);
    setJsonPreAuthCalldata(stringify(simulatedCallDataAuth ?? [], null, 2));
  }

  const isCalldataSupported = (
    currentGovernor?.supportedProposalTypes ?? [ProposalActionEnum.CALLDATA]
  ).includes(ProposalActionEnum.CALLDATA);
  const isCouncilSupported = (
    currentGovernor?.supportedProposalTypes ?? [ProposalActionEnum.COUNCIL]
  ).includes(ProposalActionEnum.COUNCIL);
  const isSettingsSupported = (
    currentGovernor?.supportedProposalTypes ?? [ProposalActionEnum.SETTINGS]
  ).includes(ProposalActionEnum.SETTINGS);
  const isSnapshotSupported = (
    currentGovernor?.supportedProposalTypes ?? [ProposalActionEnum.SNAPSHOT]
  ).includes(ProposalActionEnum.SNAPSHOT);

  return (
    <Container className="flex flex-col lg:flex-row gap-4">
      <div className="flex flex-col w-full lg:w-8/12 lg:pr-5">
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
          {isCalldataSupported && (
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
          )}
          {isCouncilSupported && (
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
          )}
          {isSettingsSupported && (
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
          )}
          {isSnapshotSupported && (
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
          )}
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
                  <>
                    <Typography.Small className="text-snapLink !my-2 ">
                      Calldata
                    </Typography.Small>
                    <TextArea
                      isError={isCalldataDisabled}
                      className="min-h-72"
                      value={jsonCalldata}
                      onChange={handleSetCalldataString}
                      placeholder={CALLDATA_PLACEHOLDER}
                    />
                  </>
                ) : (
                  <>
                    <CalldataForm
                      disabled={false}
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
                  </>
                )}
                <>
                  <Container slim className="flex flex-row items-center my-2">
                    <Typography.Small className="text-snapLink !my-2 mr-1">
                      Auths
                    </Typography.Small>
                    <Button
                      className={`${
                        useManualPreAuth
                          ? "bg-white text-black"
                          : "bg-neutral-800 text-white"
                      }  py-2 px-4`}
                      onClick={handleToggleManualPreAuth}
                    >
                      {!useManualPreAuth ? "Edit" : "Simulate"}
                    </Button>
                  </Container>
                  {inputStyle === TYPE_JSON ? (
                    <TextArea
                      isError={isCalldataDisabled}
                      className="min-h-72"
                      value={jsonPreAuthCalldata}
                      onChange={handleSetPreAuthCalldataString}
                      placeholder={"No Auth Required"}
                      disabled={!useManualPreAuth}
                    />
                  ) : (
                    <>
                      {useManualPreAuth
                        ? callDataPreAuth.map((arg, index) => (
                            <CalldataForm
                              key={index}
                              disabled={!useManualPreAuth}
                              calldata={arg}
                              onChange={(new_value) =>
                                handleAuthChange(index, new_value)
                              }
                            />
                          ))
                        : simulatedCallDataAuth?.map((arg, index) => (
                            <CalldataForm
                              key={index}
                              disabled={true}
                              calldata={arg}
                              onChange={(new_value) =>
                                handleAuthChange(index, new_value)
                              }
                            />
                          ))}

                      {useManualPreAuth && (
                        <Container
                          slim
                          className="flex gap-2 flex-row justify-start"
                        >
                          <Button className="my-2" onClick={handleRemoveAuth}>
                            Remove Auth
                          </Button>
                          <Button className="my-2" onClick={handleAddAuth}>
                            Add Auth
                          </Button>
                        </Container>
                      )}
                    </>
                  )}
                </>
                {useManualPreAuth &&
                  simulatedCallDataAuth !== undefined &&
                  !compareCalldataArrays(
                    simulatedCallDataAuth,
                    callDataPreAuth
                  ) && (
                    <>
                      <Typography.Small className="text-yellow-300">
                        The inputed pre-auth does not match the simulated
                        pre-auth. Please ensure that the manual
                        pre-authorization is correct.
                      </Typography.Small>
                      {simulatedCallDataAuth.map((auth, index) => (
                        <Typography.Small
                          className="text-yellow-300 break-all"
                          key={index}
                        >
                          Simulated Auth XDR:{" "}
                          {calldataToAuthInvocation(
                            simulatedCallDataAuth[0]
                          ).toXDR("base64")}
                        </Typography.Small>
                      ))}
                    </>
                  )}
                {calldataSimSuccess ? (
                  <Typography.Small className="text-green-500 mt-4 whitespace-pre-wrap break-all">
                    {calldataSimResult}
                  </Typography.Small>
                ) : (
                  <Container slim>
                    <Typography.Small className="text-red-500 mt-4 whitespace-pre-wrap break-all block">
                      {calldataSimResult}
                    </Typography.Small>

                    {isValidCalldata &&
                      calldataSimResult.search(/Simulation failed:/i) !==
                        -1 && (
                        <Container
                          slim
                          className="flex flex-row items-center mb-4"
                        >
                          <button
                            className={`rounded-full h-4 w-4 appearance-none border-2 focus:outline-1 focus:outline focus:outline-white mr-2 bg-white flex-shrink-0 ${
                              allowFailedSimulation
                                ? "border-snapLink border-[5px]"
                                : "border-white"
                            }`}
                            onClick={() => {
                              setAllowFailedSimulation(!allowFailedSimulation);
                            }}
                          />
                          <Typography.Small className="text-yellow-300">
                            Click to proceed with failed proposal simulation. If
                            pre-authorization is required you must manually
                            input the pre-authorization calldata.
                          </Typography.Small>
                        </Container>
                      )}
                  </Container>
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
