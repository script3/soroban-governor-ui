/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Wildcard path matching
      {
        source: "/:daoId",
        destination: "/:daoId/proposals",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
