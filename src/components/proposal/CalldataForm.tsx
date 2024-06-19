import { Container } from "@/components/common/BaseContainer";
import { Input } from "@/components/common/Input";
import Typography from "@/components/common/Typography";
import { Button } from "../common/Button";
import { TypedInput } from "../common/TypedInput";
import { Calldata, Val } from "@script3/soroban-governor-sdk";
import { isContractId } from "@/utils/validation";

export interface CalldataFormProps {
  calldata: Calldata;
  isAuth: boolean;
  setCalldata: (updateFunction: (prevState: Calldata) => Calldata) => void;
}

export function CalldataForm({
  calldata,
  isAuth,
  setCalldata,
}: CalldataFormProps) {
  function handleAddTypedInput() {
    setCalldata((prevState) => ({
      ...prevState,
      args: [...prevState.args, new Val("", "")],
      convertValsToScVals: prevState.convertValsToScVals.bind(prevState),
    }));
  }

  function handleRemoveTypedInput() {
    setCalldata((prevState) => {
      const newArgs = prevState.args.slice(0, prevState.args.length - 1);
      return {
        ...prevState,
        args: newArgs,
        convertValsToScVals: prevState.convertValsToScVals.bind(prevState),
      };
    });
  }

  function handleAddAuth() {
    setCalldata((prevState) => ({
      ...prevState,
      auths: [...prevState.auths, new Calldata("", "", [], [])],
      convertValsToScVals: prevState.convertValsToScVals.bind(prevState),
    }));
  }

  function handleRemoveAuth() {
    setCalldata((prevState) => {
      const newAuths = prevState.auths.slice(0, prevState.auths.length - 1);
      return {
        ...prevState,
        auths: newAuths,
        convertValsToScVals: prevState.convertValsToScVals.bind(prevState),
      };
    });
  }

  function handleInputChange(index: number, newValue: Val) {
    setCalldata((prevState: Calldata): Calldata => {
      const newArgs: Val[] = [...prevState.args];
      newArgs[index] = newValue;
      return {
        ...prevState,
        args: newArgs,
        convertValsToScVals: prevState.convertValsToScVals.bind(prevState),
      };
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
        onChange={function (new_value: string): void {
          setCalldata((prevState: Calldata) => {
            return {
              ...prevState,
              contract_id: new_value,
              convertValsToScVals:
                prevState.convertValsToScVals.bind(prevState),
            };
          });
        }}
      ></Input>
      <Typography.Small className="text-snapLink !my-2 ">
        Function Name
      </Typography.Small>
      <Input
        error={calldata.function === ""}
        placeholder={"Enter Function Name"}
        value={calldata.function}
        onChange={function (new_value: string): void {
          setCalldata((prevState) => {
            return {
              ...prevState,
              function: new_value,
              convertValsToScVals:
                prevState.convertValsToScVals.bind(prevState),
            };
          });
        }}
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
        <div style={{ paddingLeft: "20px" }}>
          <CalldataForm
            isAuth={true}
            calldata={arg}
            setCalldata={function (
              updateFunction: (prevState: Calldata) => Calldata
            ): void {
              setCalldata((prevState) => {
                const newAuths = [...prevState.auths];
                newAuths[index] = updateFunction(newAuths[index]);
                return {
                  ...prevState,
                  auths: newAuths,
                  convertValsToScVals:
                    prevState.convertValsToScVals.bind(prevState),
                };
              });
            }}
          />
        </div>
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
