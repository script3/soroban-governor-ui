import { Container } from "@/components/common/BaseContainer";
import { Dropdown } from "@/components/common/Dropdown";
import { Input } from "@/components/common/Input";
import { TuneButton } from "@/components/common/tune/TuneButton";
import { useState } from "react";

export default function Spaces() {
  const [searchValue, setSearchValue] = useState<string>("");
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
          <TuneButton>
            <span className="hidden xs:inline">Tune</span>
          </TuneButton>
        </div>

        <Container>
          <Dropdown
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
      </Container>
    </div>
  );
}
