import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Button } from "@/components/common/Button";
import { useEffect, useState } from "react";
import { TabBar, TabItem } from "@/components/common/Tab/TabBar";
import Typography from "@/components/common/Typography";
import { FlagIcon } from "@/components/common/icons/Flag";
import { useBreakpoints } from "@/hooks/breakpoints";

import { capitalizeFirstLetter } from "@/utils/string";
import Image from "next/image";
import { useGovernor } from "@/hooks/api";
import { useRouter } from "next/router";

export default function DAOLayout({ children }: { children: React.ReactNode }) {
  const {
    breakpoints: { lg: isLg },
  } = useBreakpoints();
  const router = useRouter();
  const params = router.query;
  const routeTab = router.pathname?.split("/")[2];
  const [activeTab, setActiveTab] = useState<string>("proposals");
  const { governor } = useGovernor(params?.dao as string, {
    enabled: !!params?.dao,
    placeholderData: {},
  });
  const Tabs: TabItem[] = [
    {
      name: "Proposals",
      route: "/proposals",
    },
    {
      name: "Your Votes",
      route: "/manage",
    },

    {
      name: "About",
      route: "/about",
    },
  ];
  useEffect(() => {
    if (routeTab) {
      const foundTab = Tabs.find((tab) => tab.route?.includes(routeTab));
      if (foundTab) {
        setActiveTab(foundTab.name);
      }
    }
  }, [routeTab]);
  console.log({ activeTab });

  return (
    <Container className="pt-4 px-12 flex flex-col lg:flex-row gap-4">
      <Container className="flex flex-col  lg:w-72 lg:min-w-72 ">
        <Box className="flex flex-col w-full pt-3 lg:!px-0 ">
          <div className="w-full mb-2 px-3">
            <Image
              className="rounded-full object-cover"
              src={governor?.logo}
              alt="project image"
              width={64}
              height={64}
            />
          </div>
          <div className="w-full px-3">
            <Typography.Huge>{governor?.name}</Typography.Huge>
          </div>
          <div className="flex w-full justify-between flex-col md:max-lg:flex-row  gap-4 px-3">
            {/* <div className="flex gap-2 items-center  flex-col w-full md:max-lg:flex-row md:max-lg:w-auto">
              <Button
                className="px-8 !bg-secondary  active:!opacity-90  !w-full md:max-lg:!w-auto"
                onClick={() => {
                  console.log("clicked join button");
                }}
              >
                Join
              </Button>
              <Button
                onClick={() => {
                  console.log("report clicked ");
                }}
                className="group text-snapLink hover:text-white  active:text-white flex gap-2 !w-full md:max-lg:!w-auto"
              >
                <FlagIcon className="group-hover:stroke-white" /> Report
              </Button>
            </div> */}
          </div>
          <div className="flex ">
            <TabBar
              tabs={Tabs}
              onClick={({ route }) => {
                router.replace(`/${params?.dao}${route}`);
              }}
              activeTabName={activeTab}
              className="lg:!flex-col lg:justify-start lg:text-left lg:items-baseline lg:mt-3"
              position={isLg ? "left" : "bottom"}
            />
          </div>
        </Box>
      </Container>
      <Container className="flex flex-col w-auto min-w-[50%]  lg:!max-w-[70%]">
        {children}
      </Container>
    </Container>
  );
}
