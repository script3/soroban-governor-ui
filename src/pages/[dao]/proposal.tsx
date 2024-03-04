import { MarkdownPreview } from "@/components/MarkdownPreview";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import MarkdownTextArea from "@/components/common/MarkdownTextArea";
import { TextArea } from "@/components/common/TextArea";
import Typography from "@/components/common/Typography";
import { CALLDATA_PLACEHOLDER, SUBCALLDATA_PLACEHOLDER } from "@/constants";
import { useWallet } from "@/hooks/wallet";
import { isCalldataString, isSubCalldataArrayString } from "@/utils/validation";
import { parse } from "json5";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CreateProposal() {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [executionCalldata, setExecutionCalldata] = useState("");
  const [executionSubCalldata, setExecutionSubCalldata] = useState("");
  const [link, setLink] = useState("");
  const { connected, connect, createProposal, walletAddress } = useWallet();
  const isSubcalldataDisabled =
    !!executionSubCalldata && !isSubCalldataArrayString(executionSubCalldata);
  const isCalldataDisabled =
    !!executionCalldata && !isCalldataString(executionCalldata);

  function handleProposal() {
    const calldata = parse(executionCalldata);
    const subCalldata = parse(executionSubCalldata);
    createProposal(
      calldata,
      subCalldata,
      title,
      description,
      false,
      "CAZA65HCGNNKGO7P66YNH3RSBVLCOJX5JXYCCUR66MMMBCT7ING4DBJL"
    );
  }

  return (
    <Container className="flex flex-col lg:flex-row gap-4">
      <div className="flex flex-col w-full lg:w-8/12 lg:pr-5">
        <Typography.P
          onClick={() => {
            router.back();
          }}
          className="text-snapLink  hover:underline cursor-pointer  flex "
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
            <Typography.Small className="text-snapLink !my-2 ">
              Execution Calldata (optional)
            </Typography.Small>
            <TextArea
              isError={isCalldataDisabled}
              className="min-h-72"
              value={executionCalldata}
              onChange={setExecutionCalldata}
              placeholder={CALLDATA_PLACEHOLDER}
            />
            <Typography.Small className="text-snapLink !my-2 ">
              Execution Subcalldata (optional)
            </Typography.Small>
            <TextArea
              isError={isSubcalldataDisabled}
              className="min-h-72"
              value={executionSubCalldata}
              onChange={setExecutionSubCalldata}
              placeholder={SUBCALLDATA_PLACEHOLDER}
            />
            <Typography.Small className="text-snapLink !my-2 ">
              Discussion (optional)
            </Typography.Small>
            <Input
              placeholder="https://forum.balancer.fi/proposal"
              type="url"
              value={link}
              onChange={setLink}
            />
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
              console.log("clicked");
              setIsPreview(!isPreview);
            }}
            disabled={!title && !description}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            className="!bg-primary  !w-full"
            disabled={
              connected &&
              (!title ||
                !description ||
                isCalldataDisabled ||
                isSubcalldataDisabled)
            }
            onClick={() => {
              if (!!connected) {
                handleProposal();
              } else {
                connect();
              }
            }}
          >
            {!connected ? "Connect Wallet" : "Create Proposal"}
          </Button>
        </Box>
      </div>
    </Container>
  );
}
