import { Inter } from "next/font/google";
import { Container } from "@/components/common/BaseContainer";

import { DAOCard } from "@/components/common/DAOCard";
import { Input } from "@/components/common/Input";

import Typography from "@/components/common/Typography";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Governor } from "@/types";
import { useGovernors } from "@/hooks/api";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useRouter();
  const { governors, isLoading } = useGovernors({
    placeholderData: [],
  });

  return (
    <Container className="mx-auto max-w-[1012px]">
      <Container className="flex w-full flex-row justify-between items-center gap-2 py-2 mb-2 ">
        <Container
          slim
          className="w-1/2 flex items-center gap-2 justify-start p-0 "
        >
          <Container slim className="w-[80%] min-w-[150px] ">
            <Input
              value={searchValue}
              placeholder="Search for DAOs"
              onChange={setSearchValue}
            />
          </Container>{" "}
          {/* <Dropdown
            buttonText="Options"
            items={[
              { text: "All", action: "all" },
              { text: "Spaces", action: "spaces" },
              { text: "Users", action: "users" },
            ]}
            selected="all"
            placement="bottom-end"
            onSelect={(action) => console.log(action)}
          /> */}
        </Container>{" "}
        <Container slim className="w-max flex">
          <Typography.Small className="text-snapLink">
            {governors.length} DAOs
          </Typography.Small>
        </Container>
      </Container>
      <Container className="w-full grid sm:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {governors
          ?.filter((dao) => new RegExp(searchValue, "ig").test(dao.name))
          .map((dao, i) => (
            <DAOCard
              title={dao.name}
              description={""}
              logo={dao.logo}
              hoverable
              key={i}
              onButtonClick={() => console.log(`Join #${i} click`)}
              onCardClick={() => router.push(`/${dao.address}/proposals`)}
              className=""
            />
          ))}
      </Container>
    </Container>
  );
}
