/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      }
    ],
    domains: ['randomuser.me', 'localhost', 'hi-hi-tutor-real-backend2.vercel.app'], // 允許從 randomuser.me 和 localhost 載入圖片
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://hi-hi-tutor-real-backend.vercel.app/api/:path*' // proxy 到 backend
      }
    ]
  }
};

module.exports = nextConfig; 