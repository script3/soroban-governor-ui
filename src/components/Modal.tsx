import { Container } from "./common/BaseContainer";
import { Button } from "./common/Button";
import Typography from "./common/Typography";

export function Modal({
  title,
  children,
  onClose,
  isOpen,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <>
      {isOpen && (
        <Container slim className="modal  z-50 mx-auto w-screen">
          <Container className="backdrop flex items-center">
            <Container className="shell  relative overflow-hidden rounded-none md:rounded-3xl">
              <Container className="p-4 text-center border-b border-snapBorder">
                <Typography.Medium>{title}</Typography.Medium>
              </Container>
              <Container className="modal-body">{children}</Container>
              <Button
                onClick={onClose}
                className="border-0 flex items-center rounded-full p-[6px] text-md text-skin-text transition-colors duration-200 hover:text-skin-link absolute right-[20px] top-[20px]"
              >
                Close
              </Button>
            </Container>
          </Container>
        </Container>
      )}
    </>
  );
}
