import Typography from "../components/common/Typography";

export function Footer() {
  return (
    <div className="flex justify-between w-full p-6 mt-4 items-stretch border-t border-snapBorder">
      <div className="flex flex-col gap-2 w-1/2 items-start justify-left ">
        <Typography.P className="text-white">Socials</Typography.P>
        <Typography.Small className="text-snapLink">Twitter</Typography.Small>
        <Typography.Small className="text-snapLink">Discord</Typography.Small>
        <Typography.Small className="text-snapLink">Telegram</Typography.Small>
        <Typography.Tiny className="text-neutral-700 mt-auto ">
          @2024 Soroban Labs.
        </Typography.Tiny>
      </div>
      <div className="flex flex-col gap-2">
        <Typography.P className="text-white">Soroban Governor</Typography.P>
        <Typography.Small className="text-snapLink">About</Typography.Small>
        <Typography.Small className="text-snapLink">Blog</Typography.Small>
      </div>
      <div className="flex flex-col gap-2">
        <Typography.P className="text-white">Resources</Typography.P>
        <Typography.Small className="text-snapLink">FAQs</Typography.Small>
        <Typography.Small className="text-snapLink">Github</Typography.Small>
        <Typography.Small className="text-snapLink">Docs</Typography.Small>
        <Typography.Small className="text-snapLink">
          Request a feature
        </Typography.Small>
        <Typography.Small className="text-snapLink">Support</Typography.Small>
      </div>
    </div>
  );
}
