/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
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
      
      // Exclude pg and related modules from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'pg': 'commonjs pg',
        'pg-native': 'commonjs pg-native',
        'pg-pool': 'commonjs pg-pool',
        'pg-boss': 'commonjs pg-boss',
      });
    }
    return config;
  },
}

module.exports = nextConfig
