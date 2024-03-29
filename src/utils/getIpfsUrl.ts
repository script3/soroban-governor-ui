export function getIpfsUrl(url: string) {
  const gateway: any = process.env.VITE_IPFS_GATEWAY || "cloudflare-ipfs.com";
  return getUrl(url, gateway);
}
export const gateways = [
  "cloudflare-ipfs.com",
  "cf-ipfs.com",
  "ipfs.io",
  "ipfs.fleek.co",
  "gateway.pinata.cloud",
  "dweb.link",
  "ipfs.infura.io",
];

export function getUrl(uri: string, gateway = gateways[0]) {
  const ipfsGateway = `https://${gateway}`;
  if (!uri) return null;
  if (
    !uri.startsWith("ipfs://") &&
    !uri.startsWith("ipns://") &&
    !uri.startsWith("https://") &&
    !uri.startsWith("http://")
  )
    return `${ipfsGateway}/ipfs/${uri}`;
  const uriScheme = uri.split("://")[0];
  if (uriScheme === "ipfs")
    return uri.replace("ipfs://", `${ipfsGateway}/ipfs/`);
  if (uriScheme === "ipns")
    return uri.replace("ipns://", `${ipfsGateway}/ipns/`);
  return uri;
}
