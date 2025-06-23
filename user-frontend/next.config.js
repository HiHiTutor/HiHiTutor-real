/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    domains: [
      'randomuser.me', 
      'localhost', 
      'hi-hi-tutor-real-backend2.vercel.app',
      'hihitutor-uploads.s3.ap-southeast-2.amazonaws.com'
    ], // 允許從這些域名載入圖片
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      }
    ]
  }
};

module.exports = nextConfig; 