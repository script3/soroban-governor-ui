import { TxStatus } from "@/hooks/wallet";
import { Container } from "../BaseContainer";
import Image from "next/image";
import Typography from "../Typography";
import { useEffect, useRef } from "react";

export function FlashNotification({
  status,
  message,
  isOpen,
  showLink,
  txHash,
  onClose,
}: {
  status: number;
  message: string;
  isOpen: boolean;
  showLink?: boolean;
  txHash?: string;
  onClose?: () => void;
}) {
  const timeoutRef = useRef<any>();

  useEffect(() => {
    // Clear the existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout if isOpen is true
    if (isOpen) {
      timeoutRef.current = setTimeout(() => {
        onClose && onClose();
      }, 7000); // Set your desired timeout duration in milliseconds
    }

    // Clean up the timeout on component unmount or when isOpen becomes false
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <Container
          slim
          className={` z-50 flex fixed mx-auto my-4 w-full md:w-1/2 box-border rounded-xl min-w-[350px] md:left-[calc(25%+60px)]  top-16  !flex-row justify-between py-6 p-3 ${
            status === TxStatus.SUCCESS ? "bg-success" : "bg-error"
          } `}
        >
          <Container slim className="w-[80%] flex flex-row gap-2 pl-4">
            {status === TxStatus.SUCCESS ? (
              <Image
                src="/icons/check.svg"
                height={24}
                width={24}
                alt="success"
              />
            ) : (
              ""
            )}
            <Container className="flex flex-col ">
              <Typography.P>
                {message?.includes("|") ? (
                  <>
                    <b>{message?.split("|")[0]}</b> | {message?.split("|")[1]}
                  </>
                ) : (
                  message
                )}
              </Typography.P>
              {showLink && txHash && (
                <Typography.P
                  onClick={() => {
                    window.open(
                      `${process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL}/tx/${txHash}`,
                      "_blank"
                    );
                  }}
                  className="underline cursor-pointer flex flex-row gap-1"
                >
                  View
                  <Image
                    src="/icons/external-link.svg"
                    width={20}
                    height={20}
                    alt="link"
                  />
                </Typography.P>
              )}
            </Container>
          </Container>

          <Container slim className="flex  w-max justify-end items-end pr-3">
            <Image
              onClick={onClose}
              src="/icons/x.svg"
              height={22}
              width={22}
              alt="close"
              className="cursor-pointer  active:opacity-50 m-auto"
            />
          </Container>
        </Container>
      )}
    </>
  );
}
