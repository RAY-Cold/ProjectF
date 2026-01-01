/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },

  webpack: (config, { isServer }) => {
    // ✅ Fix MetaMask SDK trying to import React-Native AsyncStorage in web builds
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
    };

    // ✅ Prevent occasional "fs/net/tls not found" errors from some web3 deps
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
