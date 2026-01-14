/** @type {import('next').NextConfig} */
const nextConfig = {
  // Excluir backend del build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backend/**'],
    };
    return config;
  },
};

export default nextConfig;
