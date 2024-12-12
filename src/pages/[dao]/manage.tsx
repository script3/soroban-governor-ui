import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { Loader } from "@/components/common/Loader";
import { RestoreButton } from "@/components/common/RestoreButton";
import Typography from "@/components/common/Typography";
import {
  useClaimAmount,
  useDelegate,
  useEmissionConfig,
  useGovernor,
  useVotingPower,
  useWalletBalance,
} from "@/hooks/api";
import { useWallet } from "@/hooks/wallet";
import DAOLayout from "@/layouts/dao";
import {
  bigintToString,
  scaleNumberToBigInt,
  toBalance,
} from "@/utils/formatNumber";
import { shortenAddress } from "@/utils/shortenAddress";
import { isRestoreResponse } from "@/utils/stellar";
import { getTokenExplorerUrl } from "@/utils/token";
import { rpc } from "@stellar/stellar-sdk";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import governors from "../../../public/governors/governors.json";

function ManageVotes() {
  const [toWrap, setToWrap] = useState<string>("");
  const [toUnwrap, setToUnwrap] = useState<string>("");
  const [newDelegate, setNewDelegate] = useState<string>("");
  const {
    wrapToken,
    unwrapToken,
    claimEmissions,
    connect,
    connected,
    isLoading,
    walletAddress,
    delegate,
    restore,
  } = useWallet();
  const router = useRouter();
  const params = router.query;
  const governor = useGovernor(params.dao as string);
  const { data: delegateAddressEntry, refetch: refetchDelegate } = useDelegate(
    governor?.voteTokenAddress
  );
  const delegateAddress = delegateAddressEntry?.entry;
  const hasDelegate = connected && delegateAddress !== walletAddress;

  const { data: voteTokenBalanceEntry, refetch: refetchTokenBalance } =
    useWalletBalance(governor?.voteTokenAddress);
  const voteTokenBalance = voteTokenBalanceEntry?.entry;
  const { data: votingPowerEntry, refetch: refetchVotingPower } =
    useVotingPower(governor?.voteTokenAddress);
  const votingPower = votingPowerEntry?.entry;

  const { data: underlyingTokenBalanceEntry, refetch: refetchUnderlying } =
    useWalletBalance(governor?.underlyingTokenAddress);
  const underlyingTokenBalance = underlyingTokenBalanceEntry?.entry;

  const { data: emisConfig } = useEmissionConfig(
    governor?.voteTokenAddress,
    governor?.isWrappedAsset
  );
  const { data: claimAmountSim, refetch: refetchClaimAmount } = useClaimAmount(
    governor?.voteTokenAddress,
    emisConfig?.eps !== undefined && emisConfig.eps !== BigInt(0)
  );
  const claimAmount = claimAmountSim?.entry;

  const isOldYBXGovernor =
    governor?.address ===
    "CAPPT7L7GX4NWFISYGBZSUAWBDTLHT75LHHA2H5MPWVNE7LQH3RRH6OV";

  const [restoreDelegateSim, setRestoreDelegateSim] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(delegateAddressEntry?.restoreResponse);
  const [restoreWrapSim, setRestoreWrapSim] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(undefined);
  const [restoreUnwrapSim, setRestoreUnwrapSim] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(undefined);
  const [restoreClaimSim, setRestoreClaimSim] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(claimAmountSim?.restoreResponse);

  function handleWrapClick() {
    if (governor) {
      if (!connected) {
        connect();
        return;
      } else {
        const amount = scaleNumberToBigInt(toWrap, governor.decimals);
        wrapToken(governor?.voteTokenAddress, amount).then((res) => {
          if (isRestoreResponse(res)) {
            setRestoreWrapSim(res);
          } else {
            setRestoreWrapSim(undefined);
          }
          refetchTokenBalance();
          refetchUnderlying();
          refetchVotingPower();
          if (emisConfig?.eps !== undefined && emisConfig.eps !== BigInt(0)) {
            refetchClaimAmount();
          }
          setToUnwrap("");
          setToWrap("");
        });
      }
    }
  }

  function handleUnwrapClick() {
    if (governor) {
      if (!connected) {
        connect();
        return;
      } else {
        const amount = scaleNumberToBigInt(toUnwrap, governor.decimals);
        unwrapToken(governor.voteTokenAddress, amount).then((res) => {
          if (isRestoreResponse(res)) {
            setRestoreUnwrapSim(res);
          } else {
            setRestoreUnwrapSim(undefined);
          }
          refetchUnderlying();
          refetchTokenBalance();
          refetchVotingPower();
          if (emisConfig?.eps !== undefined && emisConfig.eps !== BigInt(0)) {
            refetchClaimAmount();
          }
          setToUnwrap("");
          setToWrap("");
        });
      }
    }
  }

  function handleClaim() {
    if (governor) {
      claimEmissions(governor.voteTokenAddress).then((res) => {
        if (isRestoreResponse(res)) {
          setRestoreClaimSim(res);
        } else {
          setRestoreClaimSim(undefined);
        }
        refetchUnderlying();
        refetchTokenBalance();
        refetchVotingPower();
        refetchClaimAmount();
        setToUnwrap("");
        setToWrap("");
      });
    }
  }

  function handleDelegateClick() {
    if (governor) {
      if (!connected) {
        connect();
        return;
      } else {
        delegate(governor.voteTokenAddress, newDelegate).then((res) => {
          if (isRestoreResponse(res)) {
            setRestoreDelegateSim(res);
          } else {
            setRestoreDelegateSim(undefined);
          }
          setNewDelegate("");
          refetchDelegate();
          refetchVotingPower();
        });
      }
    }
  }

  function handleRemoveDelegateClick() {
    if (governor) {
      if (!connected) {
        connect();
        return;
      } else {
        delegate(governor.voteTokenAddress, walletAddress).then((res) => {
          if (isRestoreResponse(res)) {
            setRestoreDelegateSim(res);
          } else {
            setRestoreDelegateSim(undefined);
          }
          setNewDelegate("");
          refetchDelegate();
          refetchVotingPower();
        });
      }
    }
  }

  function handleRestore(
    sim: rpc.Api.SimulateTransactionRestoreResponse | undefined
  ) {
    if (connected && sim !== undefined) {
      restore(sim).then(() => {
        setRestoreClaimSim(undefined);
        setRestoreDelegateSim(undefined);
        setRestoreWrapSim(undefined);
        setRestoreUnwrapSim(undefined);
        refetchUnderlying();
        refetchTokenBalance();
        refetchVotingPower();
        if (emisConfig?.eps !== undefined && emisConfig.eps !== BigInt(0)) {
          refetchClaimAmount();
        }
        refetchDelegate();
      });
    }
  }

  return (
    <Container slim className="flex flex-col gap-4">
      <Container className="gap-2 flex flex-col ">
        <Typography.P
          onClick={() => {
            router.back();
          }}
          className="text-snapLink hover:underline cursor-pointer flex w-max "
        >
          <Image
            src="/icons/back-arrow.svg"
            alt="back"
            width={24}
            height={24}
          />{" "}
          Back
        </Typography.P>
        <Typography.Huge>Your Votes</Typography.Huge>
        {governor?.isWrappedAsset === true && (
          <Container>
            {isOldYBXGovernor && (
              <Container
                slim
                className="py-2 gap-1 flex flex-row items-center bg-warningOpaque rounded pl-2 mb-2"
              >
                <Image
                  src="/icons/report.svg"
                  width={28}
                  height={28}
                  alt={"close"}
                />
                <Typography.P className="text-warning">
                  {"This DAO is being sunset. Please unbond your tokens.\n\n"}
                </Typography.P>
              </Container>
            )}
            <Typography.P>
              This space uses a bonded token for voting. You can get bonded
              tokens by bonding the corresponding Stellar asset. A bonded token
              can be returned back to a Stellar asset at any time.
            </Typography.P>
            <Container slim className="py-2 gap-1 flex flex-col">
              <Typography.P>
                Stellar asset:{" "}
                <Typography.P
                  onClick={() => {
                    window.open(
                      getTokenExplorerUrl(
                        governor.underlyingTokenMetadata?.issuer || "",
                        governor?.underlyingTokenMetadata?.symbol || ""
                      ),
                      "_blank"
                    );
                  }}
                  className="text-snapLink cursor-pointer hover:underline"
                >
                  {governor?.underlyingTokenMetadata?.symbol}
                </Typography.P>
              </Typography.P>

              <Typography.P>
                Bonded token contract:{" "}
                <Typography.P
                  onClick={() => {
                    window.open(
                      `${process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL}/contract/${governor.voteTokenAddress}`,
                      "_blank"
                    );
                  }}
                  className="text-snapLink cursor-pointer hover:underline"
                >
                  {governor?.voteTokenAddress}
                </Typography.P>
              </Typography.P>
            </Container>
          </Container>
        )}
        {governor?.isWrappedAsset === false && (
          <Container slim className="py-2 gap-1 flex flex-col">
            <Typography.P>
              Contract address:{" "}
              <Typography.P
                onClick={() => {
                  window.open(
                    `${process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL}/contract/${governor.voteTokenAddress}`,
                    "_blank"
                  );
                }}
                className="text-snapLink cursor-pointer hover:underline"
              >
                {governor?.voteTokenAddress}
              </Typography.P>
            </Typography.P>
          </Container>
        )}
        <Box className="p-t-3 mb-3 flex flex-col !px-0">
          <Container className="flex flex-col p-3 gap-2  w-full">
            <Typography.Tiny className="text-snapLink">
              Current Voting power
            </Typography.Tiny>
            <Container slim className="flex gap-2">
              <Typography.P>
                {toBalance(votingPower, governor?.decimals || 7)} votes
              </Typography.P>
              {hasDelegate && (
                <Chip className="!bg-transparent border border-secondary text-secondary">
                  Delegated
                </Chip>
              )}
              {!!votingPowerEntry && !!votingPowerEntry.restoreResponse && (
                <Button
                  className="min-w-[70px] rounded-full px-[12px] justify-center items-center flex text-tiny h-[24px] w-fit leading-[23px] !bg-transparent border border-warning text-warning hover:border-white hover:text-white"
                  onClick={() =>
                    handleRestore(votingPowerEntry.restoreResponse!)
                  }
                  disabled={isLoading}
                >
                  {isLoading ? <Loader /> : "Restore"}
                </Button>
              )}
            </Container>
          </Container>
          <Container className="flex flex-col p-3 gap-2 border-t border-snapBorder w-full">
            <Typography.Tiny className="text-snapLink">
              Current Voting tokens balance
            </Typography.Tiny>
            <Container slim className="flex gap-2">
              <Typography.P>
                {toBalance(voteTokenBalance, governor?.decimals || 7)}{" "}
                {governor?.voteTokenMetadata?.symbol}
              </Typography.P>
              {hasDelegate && (
                <Chip className="!bg-transparent border border-secondary text-secondary">
                  Delegated
                </Chip>
              )}
              {!!voteTokenBalanceEntry &&
                !!voteTokenBalanceEntry.restoreResponse && (
                  <Button
                    className="min-w-[70px] rounded-full px-[12px] justify-center items-center flex text-tiny h-[24px] w-fit leading-[23px] !bg-transparent border border-warning text-warning hover:border-white hover:text-white"
                    onClick={() =>
                      handleRestore(voteTokenBalanceEntry.restoreResponse!)
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader /> : "Restore"}
                  </Button>
                )}
            </Container>
          </Container>
          {governor?.isWrappedAsset === true &&
            (restoreClaimSim !== undefined ||
              (claimAmount !== undefined && claimAmount > BigInt(0))) && (
              <>
                <Container className="flex flex-col p-3 gap-2 border-t border-snapBorder w-full">
                  <Typography.Tiny className="text-snapLink">
                    Emissions
                  </Typography.Tiny>
                  <Container slim className="flex flex-col justify-center">
                    <Typography.P>
                      {toBalance(claimAmount, governor?.decimals || 7)}{" "}
                      {governor?.voteTokenMetadata?.symbol}
                    </Typography.P>
                  </Container>
                </Container>
                <RestoreButton
                  className="!w-full rounded-b-xl rounded-t-none flex bg-white text-snapBorder"
                  onClick={handleClaim}
                  onRestore={() => handleRestore(restoreClaimSim)}
                  simResult={restoreClaimSim}
                  isLoading={isLoading}
                >
                  {isLoading ? <Loader /> : "Claim"}
                </RestoreButton>
              </>
            )}
        </Box>
        {governor?.isWrappedAsset === true && (
          <>
            <Box className="pt-3 flex gap-3 flex-col !px-0">
              <Container className="flex flex-col justify-center p-2 ">
                <Typography.P>
                  Bond {governor?.underlyingTokenMetadata?.symbol} to get{" "}
                  {governor?.voteTokenMetadata.symbol}
                </Typography.P>
                {connected && (
                  <Typography.Small className="text-snapLink">
                    Wallet balance:{" "}
                    {toBalance(underlyingTokenBalance, governor?.decimals || 7)}{" "}
                    {governor?.underlyingTokenMetadata?.symbol}
                    {/* {governor?.name || "$VOTE"} */}
                  </Typography.Small>
                )}
              </Container>
              <Container slim className="w-full flex flex-col  gap-3 px-4 ">
                <Input
                  className="!w-full flex"
                  placeholder="Amount to bond"
                  onChange={setToWrap}
                  value={toWrap}
                  type="number"
                  max={bigintToString(
                    underlyingTokenBalance ?? BigInt(0),
                    governor?.decimals || 7
                  )}
                />
              </Container>
              <RestoreButton
                className="!w-full rounded-b-xl rounded-t-none flex bg-white text-snapBorder active:opacity-50 "
                onClick={handleWrapClick}
                onRestore={() => handleRestore(restoreWrapSim)}
                simResult={restoreWrapSim}
                disabled={connected && !toWrap}
                isLoading={isLoading}
              >
                {connected ? "Bond" : "Connect wallet"}
              </RestoreButton>
            </Box>
            {voteTokenBalance && voteTokenBalance > BigInt(0) && (
              <Box className="pt-3 !px-0 flex gap-3 flex-col ">
                <Container className="flex flex-col justify-center p-2 ">
                  <Typography.P>
                    Unbond {governor?.voteTokenMetadata.symbol} to get{" "}
                    {governor?.underlyingTokenMetadata?.symbol}
                  </Typography.P>
                  {connected && (
                    <Typography.Small className="text-snapLink">
                      Voting token balance:{" "}
                      {toBalance(voteTokenBalance, governor?.decimals || 7)}{" "}
                      {governor?.voteTokenMetadata.symbol}
                    </Typography.Small>
                  )}
                </Container>
                <Container slim className="w-full flex flex-col  gap-3 px-4">
                  <Input
                    className="!w-full flex"
                    placeholder="Amount to unbond"
                    onChange={setToUnwrap}
                    value={toUnwrap}
                    type="number"
                    max={bigintToString(
                      voteTokenBalance ?? BigInt(0),
                      governor?.decimals || 7
                    )}
                  />
                </Container>
                <RestoreButton
                  className="!w-full rounded-b-xl rounded-t-none flex bg-white text-snapBorder active:opacity-50 "
                  onClick={handleUnwrapClick}
                  onRestore={() => handleRestore(restoreUnwrapSim)}
                  simResult={restoreUnwrapSim}
                  disabled={connected && !toUnwrap}
                  isLoading={isLoading}
                >
                  {connected ? "Unbond" : "Connect wallet"}
                </RestoreButton>
              </Box>
            )}
          </>
        )}
        {connected && <Typography.Big>Delegate</Typography.Big>}
        {connected &&
          ((!!restoreDelegateSim && delegateAddress === undefined) ||
            !hasDelegate) && (
            <Box className="!p-0 flex gap-3 flex-col ">
              <Container className="flex flex-col justify-center p-3 pb-0 ">
                <Typography.Small className="text-snapLink">
                  To
                </Typography.Small>
              </Container>
              <Container className="w-full flex flex-col gap-3">
                <Input
                  className=" flex"
                  placeholder="Address"
                  onChange={setNewDelegate}
                  value={newDelegate}
                />
              </Container>
              <RestoreButton
                className="!w-full rounded-b-xl rounded-t-none flex !bg-secondary text-snapBorder active:opacity-50 "
                onClick={handleDelegateClick}
                onRestore={() => handleRestore(restoreDelegateSim)}
                simResult={restoreDelegateSim}
                disabled={
                  (connected && !newDelegate) ||
                  (connected && newDelegate.toString().length < 56)
                }
                isLoading={isLoading}
              >
                {connected ? "Delegate" : "Connect wallet"}
              </RestoreButton>
            </Box>
          )}
        {connected &&
          ((hasDelegate && delegateAddress) ||
            (!!restoreDelegateSim && !!delegateAddress)) && (
            <Box className="!p-0 flex gap-3 flex-col ">
              <Container className="flex flex-col justify-center p-4 border-b border-snapBorder">
                <Typography.Small>Your delegate</Typography.Small>
              </Container>
              <Container className="w-full flex flex-row justify-between gap-3">
                <Typography.P>{shortenAddress(delegateAddress)}</Typography.P>
                <Typography.P>
                  {toBalance(
                    voteTokenBalance,
                    governor?.voteTokenMetadata?.decimals || 7
                  )}{" "}
                  {"delegated votes"}
                </Typography.P>
              </Container>
              <RestoreButton
                className="!w-full rounded-b-xl rounded-t-none flex !bg-[#49222b] text-red-500 border-red-700 active:opacity-50 "
                onClick={handleRemoveDelegateClick}
                onRestore={() => handleRestore(restoreDelegateSim)}
                simResult={restoreDelegateSim}
                isLoading={isLoading}
              >
                {connected ? "Rescind delegation" : "Connect wallet"}
              </RestoreButton>
            </Box>
          )}
      </Container>
    </Container>
  );
}

ManageVotes.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default ManageVotes;

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
