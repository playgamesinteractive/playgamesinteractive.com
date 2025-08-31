module.exports = {
  images: {
    domains: ['images.unsplash.com'],
  },
  // webpack: (config) => {
  //   config.resolve.alias.canvas = false;
  //   return config;
  // },
  async redirects() {
    return [];
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@react-email/components',
      '@react-email/render',
      '@react-email/tailwind',
    ],
  },
};
