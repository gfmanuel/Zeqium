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
        source: '/api/police/:path*',
        destination: `${apiBase}/api/police/:path*`,
      },
    ]
  },
}

export default nextConfig
