import { Container } from "@/components/common/BaseContainer";
import { Input } from "@/components/common/Input";
import Typography from "@/components/common/Typography";
import { Button } from "../common/Button";
import { TypedInput } from "../common/TypedInput";
import { Calldata, Val } from "@script3/soroban-governor-sdk";
import { isContractId } from "@/utils/validation";
import { useEffect } from "react";

export interface CalldataFormProps {
  calldata: Calldata;
  isAuth: boolean;
  onChange: (calldata: Calldata) => void;
}

export function CalldataForm({
  calldata,
  isAuth,
  onChange,
}: CalldataFormProps) {

  function handleContractIdChange(new_value: string) {
    onChange(new Calldata(
      new_value, 
      calldata.function, 
      calldata.args, 
      calldata.auths
    ));
  }

  function handleFunctionChange(new_value: string) {
    onChange(new Calldata(
      calldata.contract_id, 
      new_value, 
      calldata.args, 
      calldata.auths
    ));
  }

  function handleAddTypedInput() {
    onChange(new Calldata(
      calldata.contract_id, 
      calldata.function, 
      [...calldata.args, new Val("", { type: "" })], 
      calldata.auths)
    );
  }

  function handleRemoveTypedInput() {
    onChange(new Calldata(
      calldata.contract_id, 
      calldata.function, 
      calldata.args.slice(0, calldata.args.length - 1), 
      calldata.auths)
    );
  }

  function handleAddAuth() {
    onChange(new Calldata(
      calldata.contract_id, 
      calldata.function,
      calldata.args,
      [...calldata.auths, new Calldata("", "", [], [])]
    ));
  }

  function handleRemoveAuth() {
    onChange(new Calldata(
      calldata.contract_id, 
      calldata.function,
      calldata.args,
      calldata.auths.slice(0, calldata.auths.length - 1)
    ));
  }

  function handleInputChange(index: number, newValue: Val) {
    const newArgs: Val[] = [...calldata.args];
    newArgs[index] = newValue;
    onChange(new Calldata(
      calldata.contract_id, 
      calldata.function, 
      newArgs, 
      calldata.auths
    ));
  }

  function handleAuthChange(index: number, newAuth: Calldata) {
    const newAuths: Calldata[] = [...calldata.auths];
    newAuths[index] = newAuth;
    onChange(new Calldata(
      calldata.contract_id, 
      calldata.function, 
      calldata.args, 
      newAuths
    ));
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
      ></Input>
      <Typography.Small className="text-snapLink !my-2 ">
        Function Name
      </Typography.Small>
      <Input
        error={calldata.function === ""}
        placeholder={"Enter Function Name"}
        value={calldata.function}
        onChange={handleFunctionChange}
      ></Input>

      <Typography.Small className="text-snapLink !my-2 ">Args</Typography.Small>

      {calldata.args.map((arg, index) => (
        <TypedInput
          className="my-1"
          key={index}
          placeholder={"Enter Argument"}
          value={arg}
          onChange={(new_value) => handleInputChange(index, new_value)}
        />
      ))}
      <Container slim className="flex gap-2 flex-row justify-end">
        <Button className="my-1" onClick={handleRemoveTypedInput}>
          Remove Argument
        </Button>
        <Button className="my-1" onClick={handleAddTypedInput}>
          Add Argument
        </Button>
      </Container>
      {isAuth !== undefined && !isAuth && (
        <Typography.Small className="text-snapLink !my-2 ">
          Auths
        </Typography.Small>
      )}
      {calldata.auths.map((arg, index) => (
        <Container slim={true} className="pl-4" key={index}>
          <CalldataForm
            isAuth={true}
            calldata={arg}
            onChange={(new_value) => handleAuthChange(index, new_value)}
          />
        </Container>
      ))}

      {isAuth !== undefined && !isAuth && (
        <Container slim className="flex gap-2 flex-row justify-start">
          <Button className="my-2" onClick={handleRemoveAuth}>
            Remove Auth
          </Button>
          <Button className="my-2" onClick={handleAddAuth}>
            Add Auth
          </Button>
        </Container>
      )}
    </>
  );
}
