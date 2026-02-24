import type { NextConfig } from 'next';

const supabaseUrl = process.env.SUPABASE_URL;
const imageRemotePatterns =
  supabaseUrl &&
  (() => {
    try {
      const u = new URL(supabaseUrl);
      return [
        {
          protocol: u.protocol.replace(':', '') as 'https',
          hostname: u.hostname,
        },
      ];
    } catch {
      return undefined;
    }
  })();

const nextConfig: NextConfig = {
  ...(imageRemotePatterns && {
    images: { remotePatterns: imageRemotePatterns },
  }),
  transpilePackages: [
    '@repo/ui',
    '@repo/hooks',
    '@repo/constants',
    '@repo/utils',
    '@repo/types',
    '@repo/schemas',
    '@repo/contexts',
  ],
};

export default nextConfig;
