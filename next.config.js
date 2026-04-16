/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/blog/what-are-scratch-and-dent-appliances',
        destination: '/blog/scratch-and-dent-appliances-complete-guide',
        permanent: true,
      },
      {
        source: '/blog/are-scratch-and-dent-appliances-worth-it',
        destination: '/blog/scratch-and-dent-appliances-complete-guide',
        permanent: true,
      },
      {
        source: '/blog/how-to-find-the-best-deals-near-me',
        destination: '/blog/scratch-and-dent-appliances-complete-guide',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
