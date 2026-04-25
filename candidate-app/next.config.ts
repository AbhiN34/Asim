import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep pdf-parse and mammoth as native Node modules — they use fs/buffers
  // that Next.js's bundler can't handle correctly.
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
