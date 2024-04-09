import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Input } from "@/components/common/Input";
import { Loader } from "@/components/common/Loader";
import Typography from "@/components/common/Typography";
import {
  useDelegate,
  useGovernor,
  useUnderlyingTokenBalance,
  useVoteTokenBalance,
} from "@/hooks/api";
import { useWallet } from "@/hooks/wallet";
import DAOLayout from "@/layouts/dao";
import { scaleNumberToBigInt, toBalance } from "@/utils/formatNumber";
import { shortenAddress } from "@/utils/shortenAddress";
import Image from "next/image";
import { useRouter } from "next/router";

import { useState } from "react";

function ManageVotes() {
  const [toWrap, setToWrap] = useState<string>("");
  const [toUnwrap, setToUnwrap] = useState<string>("");
  const [newDelegate, setNewDelegate] = useState<string>("");
  const {
    wrapToken,
    unwrapToken,
    connect,
    connected,
    isLoading,
    walletAddress,
    delegate,
  } = useWallet();
  const router = useRouter();
  const params = router.query;
  const { governor } = useGovernor(params.dao as string, {
    placeholderData: {},
  });
  const { delegateAddress, refetch: refetchDelegate } = useDelegate(
    governor?.voteTokenAddress,
    {
      enabled: connected && !!governor?.voteTokenAddress,
    }
  );
  const hasDelegate = connected && delegateAddress !== walletAddress;
  const { balance, refetch: refetchBalance } = useVoteTokenBalance(
    governor?.voteTokenAddress,
    {
      placeholderData: BigInt(0),
      enabled: connected && !!governor?.voteTokenAddress,
    }
  );

  const { balance: underlyingTokenBalance, refetch: refetchunderlying } =
    useUnderlyingTokenBalance(governor?.underlyingTokenAddress || "", {
      enabled: connected && !!governor?.underlyingTokenAddress,
      placeholderData: BigInt(0),
    });
  function handleWrapClick() {
    if (!connected) {
      connect();
      return;
    } else {
      const amount = scaleNumberToBigInt(toWrap, governor?.decimals);
      wrapToken(governor?.voteTokenAddress, amount, false).then((res) => {
        refetchBalance();
        refetchunderlying();
        setToUnwrap("");
        setToWrap("");
      });
    }
  }

  function handleUnwrapClick() {
    if (!connected) {
      connect();
      return;
    } else {
      const amount = scaleNumberToBigInt(toUnwrap, governor?.decimals);
      unwrapToken(governor?.voteTokenAddress, amount, false).then((res) => {
        refetchunderlying();
        refetchBalance();
        setToUnwrap("");
        setToWrap("");
      });
    }
  }

  function handleDelegateClick() {
    if (!connected) {
      connect();
      return;
    } else {
      delegate(governor?.voteTokenAddress, newDelegate, false).then(() => {
        setNewDelegate("");
        refetchDelegate();
      });
    }
  }

  function handleRemoveDelegateClick() {
    if (!connected) {
      connect();
      return;
    } else {
      delegate(governor?.voteTokenAddress, walletAddress, false).then(() => {
        setNewDelegate("");
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
        <Typography.Huge>Voting Power Management</Typography.Huge>
        <Box className="flex gap-3 flex-col !px-0">
          <Container className="flex flex-col p-3 gap-2 border-b border-snapBorder w-full">
            <Typography.Tiny className="text-snapLink">
              Current Voting power
            </Typography.Tiny>
            <Container slim className="flex gap-2">
              <Typography.P>
                {toBalance(balance, governor?.decimals || 7)}{" "}
                {governor?.voteTokenMetadata?.symbol}
              </Typography.P>
              {hasDelegate && (
                <Chip className="!bg-transparent border border-secondary text-secondary">
                  Delegated
                </Chip>
              )}
            </Container>
          </Container>
          <Container className="flex flex-col justify-center p-2 ">
            <Typography.P>
              Deposit {governor?.underlyingTokenMetadata?.symbol} to get voting
              tokens{" "}
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
          <Container
            slim
            className="w-full flex flex-row  gap-3 px-1 pt-2 pb-3"
          >
            <Input
              className="!w-1/3 flex"
              placeholder="Amount to deposit"
              onChange={setToWrap}
              value={toWrap}
              type="number"
            />
            <Button
              className="w-1/2 flex !bg-white text-snapBorder active:opacity-50 "
              onClick={handleWrapClick}
              disabled={isLoading || (connected && !toWrap)}
            >
              {isLoading ? (
                <Loader />
              ) : connected ? (
                "Deposit"
              ) : (
                "Connect wallet"
              )}
            </Button>
          </Container>
        </Box>
        {balance > BigInt(0) && (
          <Box className="p-3 flex gap-3 flex-col ">
            <Container slim className="flex flex-col justify-center p-1 ">
              <Typography.P>
                Withdraw {governor?.voteTokenMetadata.symbol} from the space
              </Typography.P>
              {connected && (
                <Typography.Small className="text-snapLink">
                  Voting token balance:{" "}
                  {toBalance(balance, governor?.decimals || 7)}{" "}
                  {governor?.voteTokenMetadata.symbol}
                </Typography.Small>
              )}
            </Container>
            <Container slim className="w-full flex flex-row  gap-3">
              <Input
                className="!w-1/3 flex"
                placeholder="Amount to withdraw"
                onChange={setToUnwrap}
                value={toUnwrap}
                type="number"
              />
              <Button
                className="w-1/2 flex !bg-white text-snapBorder active:opacity-50 "
                onClick={handleUnwrapClick}
                disabled={isLoading || (connected && !toUnwrap)}
              >
                {isLoading ? (
                  <Loader />
                ) : connected ? (
                  "Withdraw"
                ) : (
                  "Connect wallet"
                )}
              </Button>
            </Container>
          </Box>
        )}
        {connected && <Typography.Big>Delegate</Typography.Big>}
        {connected && !hasDelegate && (
          <Box className="!p-0 flex gap-3 flex-col ">
            <Container className="flex flex-col justify-center p-3 pb-0 ">
              <Typography.Small className="text-snapLink">To</Typography.Small>
            </Container>
            <Container className="w-full flex flex-col gap-3">
              <Input
                className=" flex"
                placeholder="Address"
                onChange={setNewDelegate}
                value={newDelegate}
              />
            </Container>
            <Button
              className="!w-full rounded-b-xl rounded-t-none flex !bg-secondary text-snapBorder active:opacity-50 "
              onClick={handleDelegateClick}
              disabled={
                isLoading ||
                (connected && !newDelegate) ||
                (connected && newDelegate.toString().length < 56)
              }
            >
              {isLoading ? (
                <Loader />
              ) : connected ? (
                "Delegate"
              ) : (
                "Connect wallet"
              )}
            </Button>
          </Box>
        )}
        {connected && !!hasDelegate && (
          <Box className="!p-0 flex gap-3 flex-col ">
            <Container className="flex flex-col justify-center p-4 border-b border-snapBorder">
              <Typography.Small>Your delegate</Typography.Small>
            </Container>
            <Container className="w-full flex flex-row justify-between gap-3">
              <Typography.P>{shortenAddress(delegateAddress)}</Typography.P>
              <Typography.P>
                {toBalance(underlyingTokenBalance, governor?.decimals || 7)}{" "}
                {governor?.underlyingTokenMetadata?.symbol}
              </Typography.P>
            </Container>
            <Button
              className="!w-full rounded-b-xl rounded-t-none flex !bg-[#49222b] text-red-500 border-red-700 active:opacity-50 "
              onClick={handleRemoveDelegateClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader />
              ) : connected ? (
                "Rescind delegation"
              ) : (
                "Connect wallet"
              )}
            </Button>
          </Box>
        )}
      </Container>
    </Container>
  );
}

ManageVotes.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default ManageVotes;

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
