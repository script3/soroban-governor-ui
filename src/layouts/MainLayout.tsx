import { FlashNotification } from "@/components/common/notification/FlashNotification";
import { SideBar } from "../components/Nav/Sidebar";
import { TopBar } from "../components/Nav/Topbar";
import { Footer } from "./Footer";
import { ModalNotification } from "@/components/common/notification/ModalNotification";
import { Modal } from "@/components/Modal";
import { TxStatus, useWallet } from "@/hooks/wallet";
import { useState } from "react";
import { Container } from "@/components/common/BaseContainer";

export interface MainLayoutProps {
  children: React.ReactNode;
}
export function MainLayout({ children }: MainLayoutProps) {
  const {
    txStatus,
    clearLastTx,
    notificationMode,
    lastTxMessage: txMessage,
    notificationTitle,
    showNotification,
  } = useWallet();
  function getNotificationTitle() {
    if (!!notificationTitle) {
      return notificationTitle;
    }
    if (txStatus === TxStatus.SUCCESS) {
      return "Transaction Successful";
    }

    if (txStatus === TxStatus.FAIL) {
      return "Transaction Failed";
    }

    return "";
  }

  return (
    <Container slim className="flex flex-row">
      <SideBar />
      <Container slim className="w-full">
        <TopBar />
        {children}
        <FlashNotification
          isOpen={showNotification && notificationMode === "flash"}
          status={txStatus}
          message={txMessage as string}
          onClose={() => {
            clearLastTx();
          }}
        />
        <Modal
          title={getNotificationTitle()}
          onClose={() => {
            clearLastTx();
          }}
          isOpen={showNotification && notificationMode === "modal"}
        >
          <ModalNotification
            onClose={() => {
              clearLastTx();
            }}
            message={txMessage || ""}
          />
        </Modal>
        {/* <Footer /> */}
      </Container>
    </Container>
  );
}
