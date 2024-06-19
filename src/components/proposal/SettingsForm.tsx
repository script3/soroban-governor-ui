import { Input } from "@/components/common/Input";
import Typography from "@/components/common/Typography";
import { isAddress } from "@/utils/validation";
import { GovernorSettings } from "@script3/soroban-governor-sdk";
import { useState } from "react";

export interface SettingsFormProps {
  settings: GovernorSettings;
  setSettings: (
    updateFunction: (prevState: GovernorSettings) => GovernorSettings
  ) => void;
}

export function SettingsForm({ settings, setSettings }: SettingsFormProps) {
  const [countingType, setCountingType] = useState<string>("");
  const [gracePeriod, setGracePeriod] = useState<string>("");
  const [proposalThreshold, setProposalThreshold] = useState<string>("");
  const [quorum, setQuorum] = useState<string>("");
  const [timelock, setTimelock] = useState<string>("");
  const [voteDelay, setVoteDelay] = useState<string>("");
  const [votePeriod, setVotePeriod] = useState<string>("");
  const [voteThreshold, setVoteThreshold] = useState<string>("");
  return (
    <>
      <Typography.Small className="text-snapLink !my-2 ">
        Counting Type
      </Typography.Small>
      <Input
        error={
          countingType === "" ||
          parseInt(countingType) < 1 ||
          parseInt(countingType) > 7
        }
        errorMessage="Counting Type must be a number between 1 and 7"
        type="number"
        placeholder={"Enter The Counting Type"}
        value={countingType}
        onChange={function (newValue: string): void {
          setCountingType(newValue);
          if (!isNaN(parseInt(newValue))) {
            setSettings((prevState) => {
              return {
                ...prevState,
                counting_type: parseInt(newValue),
              };
            });
          }
        }}
      />

      <Typography.Small className="text-snapLink !my-2 ">
        Grace Period
      </Typography.Small>
      <Input
        error={
          gracePeriod === "" ||
          parseInt(gracePeriod) > 120960 ||
          parseInt(gracePeriod) < 17280
        }
        errorMessage="Grace Period must be a number between 17280 and 120960"
        type="number"
        placeholder={"Enter The Grace Period"}
        value={gracePeriod}
        onChange={function (newValue: string): void {
          setGracePeriod(newValue);
          if (!isNaN(parseInt(newValue))) {
            setSettings((prevState) => {
              return {
                ...prevState,
                grace_period: parseInt(newValue),
              };
            });
          }
        }}
      />
      <Typography.Small className="text-snapLink !my-2 ">
        Proposal Threshold
      </Typography.Small>
      <Input
        error={proposalThreshold === "" || parseInt(gracePeriod) < 1}
        errorMessage="Proposal Threshold must be atleast 1 or more"
        type="number"
        placeholder={"Enter The Proposal Threshold"}
        value={proposalThreshold}
        onChange={function (newValue: string): void {
          setProposalThreshold(newValue);
          if (!isNaN(parseInt(newValue))) {
            setSettings((prevState) => {
              return {
                ...prevState,
                proposal_threshold: BigInt(newValue),
              };
            });
          }
        }}
      />

      <Typography.Small className="text-snapLink !my-2 ">
        Quorum
      </Typography.Small>
      <Input
        error={
          quorum === "" || parseInt(quorum) > 9900 || parseInt(quorum) < 10
        }
        errorMessage="Quorum must be a number between 10 and 9900"
        type="number"
        placeholder={"Enter Qourum Threshold"}
        value={quorum}
        onChange={function (newValue: string): void {
          setQuorum(newValue);
          if (newValue !== "") {
            setSettings((prevState) => {
              return {
                ...prevState,
                quorum: parseInt(newValue),
              };
            });
          }
        }}
      />
      <Typography.Small className="text-snapLink !my-2 ">
        Timelock
      </Typography.Small>
      <Input
        error={timelock === ""}
        type="number"
        placeholder={"Enter The Timelock Period"}
        value={timelock}
        onChange={function (newValue: string): void {
          setTimelock(newValue);
          if (newValue !== "") {
            setSettings((prevState) => {
              return {
                ...prevState,
                timelock: parseInt(newValue),
              };
            });
          }
        }}
      />
      <Typography.Small className="text-snapLink !my-2 ">
        Vote Delay
      </Typography.Small>
      <Input
        error={voteDelay === ""}
        type="number"
        placeholder={"Enter The Vote Delay"}
        value={voteDelay}
        onChange={function (newValue: string): void {
          setVoteDelay(newValue);
          voteDelay;
          setSettings((prevState) => {
            return {
              ...prevState,
              vote_delay: parseInt(newValue),
            };
          });
        }}
      />
      <Typography.Small className="text-snapLink !my-2 ">
        Vote Period
      </Typography.Small>
      <Input
        error={
          votePeriod === "" ||
          parseInt(votePeriod) > 120960 ||
          parseInt(votePeriod) < 720
        }
        errorMessage="Vote Period must be a number between 720 and 120960"
        type="number"
        placeholder={"Enter The Vote Period"}
        value={votePeriod}
        onChange={function (newValue: string): void {
          setVotePeriod(newValue);
          if (newValue !== "") {
            setSettings((prevState) => {
              return {
                ...prevState,
                vote_period: parseInt(newValue),
              };
            });
          }
        }}
      />
      <Typography.Small className="text-snapLink !my-2 ">
        Vote Threshold
      </Typography.Small>
      <Input
        error={
          voteThreshold === "" ||
          parseInt(voteThreshold) > 9900 ||
          parseInt(voteThreshold) < 10
        }
        errorMessage="Vote Threshold must be a number between 10 and 9900"
        type="number"
        placeholder={"Enter The Vote Threshold"}
        value={voteThreshold}
        onChange={function (newValue: string): void {
          setVoteThreshold(newValue);
          if (newValue !== "") {
            setSettings((prevState) => {
              return {
                ...prevState,
                vote_threshold: parseInt(newValue),
              };
            });
          }
        }}
      />
    </>
  );
}
