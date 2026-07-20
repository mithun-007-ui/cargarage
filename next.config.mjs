/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/my bookings',
        destination: '/my-bookings',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
