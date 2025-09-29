/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only modules for the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
      
      // Exclude all pg-related modules from client bundle
      config.externals = [
        ...(config.externals || []),
        'pg',
        'pg-native',
        'pg-pool',
        'pg-boss',
        'pg-connection-string',
        'pg-protocol',
        'pg-types',
        'pgpass',
        'pg-int8',
      ];
    }
    return config;
  },
}

module.exports = nextConfig
