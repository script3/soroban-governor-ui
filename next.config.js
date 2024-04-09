/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // async redirects() {
  //   return [
  //     // Wildcard path matching
  //     {
  //       source: "/:daoId",
  //       destination: "/:daoId/proposals",
  //       permanent: true,
  //     },
  //   ];
  // },
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["cdn.stamp.fyi"],
  },
};

module.exports = nextConfig;
