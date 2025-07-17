import { Container } from "@/components/common/BaseContainer";
import { Input } from "@/components/common/Input";
import Typography from "@/components/common/Typography";
import { Button } from "../common/Button";
import { TypedInput } from "../common/TypedInput";
import { Calldata, Val } from "@script3/soroban-governor-sdk";
import { isContractId } from "@/utils/validation";
import { nativeToScVal } from "@stellar/stellar-sdk";

export interface CalldataFormProps {
  calldata: Calldata;
  disabled: boolean;
  onChange: (calldata: Calldata) => void;
}

export function CalldataForm({
  calldata,
  disabled,
  onChange,
}: CalldataFormProps) {
  function handleContractIdChange(new_value: string) {
    onChange({
      contract_id: new_value,
      function: calldata.function,
      args: calldata.args,
      auths: calldata.auths,
    });
  }

  function handleFunctionChange(new_value: string) {
    onChange({
      contract_id: calldata.contract_id,
      function: new_value,
      args: calldata.args,
      auths: calldata.auths,
    });
  }

  function handleAddTypedInput() {
    onChange({
      contract_id: calldata.contract_id,
      function: calldata.function,
      args: [...calldata.args, { value: "", type: { type: "" } }],
      auths: calldata.auths,
    });
  }

  function handleRemoveTypedInput() {
    onChange({
      contract_id: calldata.contract_id,
      function: calldata.function,
      args: calldata.args.slice(0, calldata.args.length - 1),
      auths: calldata.auths,
    });
  }

  function handleInputChange(index: number, newValue: Val) {
    const newArgs: Val[] = [...calldata.args];
    newArgs[index] = newValue;
    onChange({
      contract_id: calldata.contract_id,
      function: calldata.function,
      args: newArgs,
      auths: calldata.auths,
    });
  }

  return (
    <>
      <Typography.Small className="text-snapLink !my-2 ">
        Contract Id
      </Typography.Small>
      <Input
        error={isContractId(calldata.contract_id) === false}
        placeholder={"Enter Contract Id"}
        value={calldata.contract_id}
        onChange={handleContractIdChange}
        isDisabled={disabled}
      ></Input>
      <Typography.Small className="text-snapLink !my-2 ">
        Function Name
      </Typography.Small>
      <Input
        error={calldata.function === ""}
        placeholder={"Enter Function Name"}
        value={calldata.function}
        onChange={handleFunctionChange}
        isDisabled={disabled}
      ></Input>

      <Typography.Small className="text-snapLink !my-2 ">Args</Typography.Small>

      {calldata.args.map((arg, index) => (
        <TypedInput
          className="my-1"
          key={index}
          placeholder={"Enter Argument"}
          value={arg}
          onChange={(new_value) => handleInputChange(index, new_value)}
          isDisabled={disabled}
          error={(() => {
            try {
              nativeToScVal(arg.value, arg.type);
              return false;
            } catch (e) {
              return true;
            }
          })()}
        />
      ))}
      {!disabled && (
        <Container slim className="flex gap-2 flex-row justify-end">
          <Button
            className="my-1"
            onClick={handleRemoveTypedInput}
            disabled={disabled}
          >
            Remove Argument
          </Button>
          <Button
            className="my-1"
            onClick={handleAddTypedInput}
            disabled={disabled}
          >
            Add Argument
          </Button>
        </Container>
      )}
    </>
  );
}
