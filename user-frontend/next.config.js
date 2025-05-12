/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      }
    ],
    domains: ['randomuser.me', 'localhost'], // 允許從 randomuser.me 和 localhost 載入圖片
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