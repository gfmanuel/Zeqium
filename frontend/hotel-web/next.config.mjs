/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: import.meta.dirname,
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost'
    return [
      {
        source: '/api/hotel/:path*',
        destination: `${apiBase}/api/hotel/:path*`,
      },
    ]
  },
}

export default nextConfig
