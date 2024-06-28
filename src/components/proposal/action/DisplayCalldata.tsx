import { Box } from "@/components/common/Box";
import Typography from "@/components/common/Typography";
import { Calldata } from "@script3/soroban-governor-sdk";
import { Container } from "@/components/common/BaseContainer";
import ExpandableComponent from "@/components/common/ExpanableContainer";
import { jsonReplacer } from "@/utils/stellar";

export function DisplayCalldata({ calldata }: { calldata: Calldata }) {
  return (
    <Container className="flex flex-col gap-3">
      <Typography.P className="mb-2">Contract ID:</Typography.P>
      <Box className="p-4 box-border">
        <code className="whitespace-pre-wrap word-break p-1 ">
          {calldata.contract_id}
        </code>
      </Box>
      <Typography.P className="mb-2">Function:</Typography.P>
      <Box className="p-4 box-border">
        <code className="whitespace-pre-wrap word-break p-1 ">
          {calldata.function}
        </code>
      </Box>
      <Typography.P className="mb-2">Arguments:</Typography.P>
      {calldata.args.map((arg, index) => {
        let real_arg = arg as any;
        let arg_as_string = typeof real_arg === "object" ? 
          JSON.stringify(real_arg, jsonReplacer, 2) : 
          (real_arg?.toString() ?? real_arg);
        return (
          <Box key={"arg" + index} className="p-4 box-border">
            <code className="whitespace-pre-wrap word-break !p-0 leading-7 text-left justify-start ">
              {arg_as_string}
            </code>
          </Box>
        );
      })}
      <Typography.P className="mb-2">Auths:</Typography.P>
      <code className="whitespace-pre-wrap word-break !p-0 ">
        {calldata.auths.length > 0 ? (
          calldata.auths.map((auth, index) => {
            return (
              <ExpandableComponent
                key={index}
                name={"Function: " + auth.function}
              >
                <DisplayCalldata calldata={auth} />
              </ExpandableComponent>
            );
          })
        ) : (
          <Box className="p-4 box-border">None</Box>
        )}
      </code>
    </Container>
  );
}
