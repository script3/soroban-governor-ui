import { Container } from "../BaseContainer";
import { Button } from "../Button";
import Typography from "../Typography";

export function ModalNotification({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  function handleClose() {
    onClose && onClose();
  }
  return (
    <Container slim className="flex flex-col gap-4 p-2">
      <Container
        slim
        className="flex flex-col gap-4 justify-center text-center"
      >
        <Typography.P className="text-snapLink">{message}</Typography.P>
      </Container>
      {/* <Container slim>share?</Container> */}
      <Container slim className="px-4 py-4">
        <Button
          onClick={handleClose}
          className="!w-full !bg-primary active:opacity-65"
        >
          Close
        </Button>
      </Container>
    </Container>
  );
}
