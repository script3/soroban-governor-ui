import { Container } from "@/components/common/BaseContainer";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { DAOCard } from "@/components/common/DAOCard";
import { Dropdown } from "@/components/common/Dropdown";
import { Input } from "@/components/common/Input";
import { Toggle } from "@/components/common/Switch";
import { useState } from "react";
const ThreeDotsSVG = (
  <svg
    fill="#fff"
    height="24px"
    width="24px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32.055 32.055"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <g>
        {" "}
        <path d="M3.968,12.061C1.775,12.061,0,13.835,0,16.027c0,2.192,1.773,3.967,3.968,3.967c2.189,0,3.966-1.772,3.966-3.967 C7.934,13.835,6.157,12.061,3.968,12.061z M16.233,12.061c-2.188,0-3.968,1.773-3.968,3.965c0,2.192,1.778,3.967,3.968,3.967 s3.97-1.772,3.97-3.967C20.201,13.835,18.423,12.061,16.233,12.061z M28.09,12.061c-2.192,0-3.969,1.774-3.969,3.967 c0,2.19,1.774,3.965,3.969,3.965c2.188,0,3.965-1.772,3.965-3.965S30.278,12.061,28.09,12.061z"></path>{" "}
      </g>{" "}
    </g>
  </svg>
);
export default function Spaces() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selected, setSelected] = useState<string>("All");
  const [selected2, setSelected2] = useState<string>("All");
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  const [toggleValue2, setToggleValue2] = useState<boolean>(false);
  const handleChange = (newValue: string) => {
    console.log(newValue);
    setSearchValue(newValue);
  };
  return (
    <div className="relative">
      <Container className="mb-4 flex flex-col flex-wrap items-center xs:flex-row md:flex-nowrap">
        <div tabIndex={-1} className="w-full md:max-w-[420px]">
          <Input
            value={searchValue}
            placeholder="search for something"
            onChange={handleChange}
          />
        </div>

        <div className="mt-2 whitespace-nowrap text-right text-skin-text xs:ml-auto xs:mt-0">
          <Button
            onClick={() => {
              console.log("click");
            }}
          >
            Enable button
          </Button>
          <Button
            onClick={() => {
              console.log("click");
            }}
            disabled
          >
            Disabled button
          </Button>
        </div>

        <Container className="flex flex-col items-center gap-3">
          <Chip className="bg-red-500">Problem</Chip>
          <Chip className="bg-slate-100 text-black">Clear</Chip>
          <Chip className="bg-purple-500">Closed</Chip>
          <Chip>Active</Chip>
        </Container>
        <Container className="flex flex-col items-center ">
          <Toggle value={toggleValue} onChange={setToggleValue} />
          <Toggle value={toggleValue2} onChange={setToggleValue2} />
          <Toggle
            disabled
            value={toggleValue}
            onChange={setToggleValue}
            color="purple-500"
          />
        </Container>
        <Container className="flex items-center gap-2">
          <Dropdown
            buttonText="Options"
            items={[
              { text: "All", action: "all" },
              { text: "Spaces", action: "spaces" },
              { text: "Users", action: "users" },
            ]}
            selected="all"
            placement="bottom-end"
            onSelect={(action) => console.log(action)}
          />
          <Dropdown
            buttonText={ThreeDotsSVG}
            chevron={false}
            items={[
              { text: "All", action: "all" },
              { text: "Spaces", action: "spaces" },
              { text: "Users", action: "users" },
            ]}
            selected="all"
            placement="bottom-end"
            onSelect={(action) => console.log(action)}
          />
        </Container>
        <Container className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <DAOCard
              title={`Stargate DAO #${i}`}
              description={`84${i} Members`}
              buttonText="Join"
              hoverable
              key={i}
              onButtonClick={() => console.log(`Join #${i} click`)}
              onCardClick={() => console.log(`Card #${i} click`)}
            />
          ))}
        </Container>
      </Container>
    </div>
  );
}
