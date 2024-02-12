import DAOLayout from "@/layouts/dao";
import { Container } from "@/components/common/BaseContainer";
import { Box } from "@/components/common/Box";
import { Dropdown } from "@/components/common/Dropdown";
import { Input } from "@/components/common/Input";
import { Toggle } from "@/components/common/Switch";
import Typography from "@/components/common/Typography";

import { mockDAOS } from "@/mock/dao";
import { useState } from "react";
import Image from "next/image";
const mockDAO = mockDAOS[0];
function About() {
  const [newName, setNewName] = useState<string>(mockDAO.name);
  const [newAbout, setNewAbout] = useState<string>(mockDAO.name);
  const [newWebsite, setNewWebsite] = useState<string>(mockDAO.name);
  const [newTerms, setNewTerms] = useState<string>(mockDAO.name);
  const [newHide, setNewHide] = useState<boolean>(!!mockDAO.name);
  return (
    <Container slim className=" mt-3 flex flex-col gap-6 w-full">
      <Box className="flex flex-col gap-3 p-4 w-full">
        <Typography.Big>Profile</Typography.Big>
        <Typography.Small>Avatar</Typography.Small>
        <div className="flex w-full">
          <Image
            className="rounded-full object-cover"
            src={mockDAO.logo}
            alt="project image"
            width={64}
            height={64}
          />
          {/* upload new image input  */}
        </div>
        <Typography.Small>Name</Typography.Small>
        <Input placeholder="" value={newName} onChange={setNewName} />
        <Typography.Small>About</Typography.Small>
        <Input placeholder="" value={newAbout} onChange={setNewAbout} />
        <Typography.Small>Website</Typography.Small>
        <Input
          icon={
            <Image
              alt="Url"
              src="/icons/world.svg"
              width={18}
              height={18}
              className="stroke-snapLink"
            />
          }
          type="url"
          placeholder="your website url"
          value={newWebsite}
          onChange={setNewWebsite}
        />
        <Typography.Small>Terms of Service</Typography.Small>
        <Input
          icon={
            <Image
              alt="Url"
              src="/icons/world.svg"
              width={18}
              height={18}
              className="stroke-snapLink"
            />
          }
          type="url"
          placeholder="Terms of Service url"
          value={newTerms}
          onChange={setNewTerms}
        />
        <Typography.Small>Hide from home page</Typography.Small>
        <Toggle value={newHide} onChange={setNewHide} />
      </Box>
      <Box>
        <Typography.Big>Social</Typography.Big>
        <div className="flex gap-3 justify-between p-4 ">
          <div className="flex flex-col justify-left">
            <Typography.Tiny className="text-snapLink">Twitter</Typography.Tiny>
          </div>
          <div className="flex flex-col justify-left">
            <Typography.Tiny className="text-snapLink">Github</Typography.Tiny>
          </div>
          <div className="flex flex-col justify-left">
            <Typography.Tiny className="text-snapLink">
              CoinGecko
            </Typography.Tiny>
          </div>
        </div>
      </Box>
    </Container>
  );
}

About.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default About;
