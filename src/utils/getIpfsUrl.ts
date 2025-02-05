export const gateways = [
  "cf-ipfs.com",
  "ipfs.io",
  "ipfs.fleek.co",
  "gateway.pinata.cloud",
  "dweb.link",
  "ipfs.infura.io",
  "ipfs.4everland.io",
];

export async function getIpfsUrl(uri: string) {
  try {
    const result = await Promise.any(
      gateways.map(async (gateway) => {
        try {
          let url = uri;
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
            url = url.replace("ipfs://", `${ipfsGateway}/ipfs/`);
          if (uriScheme === "ipns")
            url = url.replace("ipns://", `${ipfsGateway}/ipns/`);
          let response;
          try {
            response = await fetch(url);
          } catch (e) {
            return Promise.reject(e);
          }
          if (response.ok) return Promise.resolve(url);
          return Promise.reject(response.status);
        } catch (e) {
          return Promise.reject(e);
        }
      })
    );
    return result;
  } catch (e) {
    return uri;
  }
}
