import Image from "next/image";
import { Inter } from "next/font/google";
import { Container } from "@/components/common/BaseContainer";
import { mockDAOS } from "@/mock/dao";
import { DAOCard } from "@/components/common/DAOCard";
import { Input } from "@/components/common/Input";
import { Dropdown } from "@/components/common/Dropdown";
import Typography from "@/components/common/Typography";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useRouter();
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
              placeholder="search for DAOs"
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
            {mockDAOS.length} DAOs
          </Typography.Small>
        </Container>
      </Container>
      <Container className="w-full grid sm:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {mockDAOS
          .filter((dao) => new RegExp(searchValue, "ig").test(dao.name))
          .map((dao, i) => (
            <DAOCard
              title={dao.name}
              description={`${dao.memberCount} Members`}
              buttonText="Join"
              hoverable
              key={i}
              onButtonClick={() => console.log(`Join #${i} click`)}
              onCardClick={() => router.push(`/${dao.name}/proposals`)}
              className=""
            />
          ))}
      </Container>
    </Container>
  );
}
