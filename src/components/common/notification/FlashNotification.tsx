import { TxStatus } from "@/hooks/wallet";
import { Container } from "../BaseContainer";
import Image from "next/image";
import Typography from "../Typography";
import { useEffect, useRef } from "react";

export function FlashNotification({
  status,
  message,
  isOpen,
  onClose,
}: {
  status: number;
  message: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const timeoutRef = useRef<any>();

  useEffect(() => {
    // Clear the existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout if isOpen is true
    // if (isOpen) {
    //   timeoutRef.current = setTimeout(() => {
    //     onClose && onClose();
    //   }, 2000); // Set your desired timeout duration in milliseconds
    // }

    // // Clean up the timeout on component unmount or when isOpen becomes false
    // return () => {
    //   if (timeoutRef.current) {
    //     clearTimeout(timeoutRef.current);
    //   }
    // };
  }, [isOpen, onClose]);
  return (
    <>
      {isOpen && (
        <Container
          slim
          className={` flex rounded-full fixed bottom-10 min-w-[350px] !flex-row justify-between left-[calc(50%-175px)] p-3 ${
            status === TxStatus.SUCCESS ? "bg-success" : "bg-error"
          } `}
        >
          <Container slim className="w-[90%] flex flex-row gap-2 pl-4">
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
            <Typography.P>{message}</Typography.P>
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
