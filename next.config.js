/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // 이미지 최적화를 비활성화합니다.
    domains: ['vercel.app'], // Vercel 도메인을 추가합니다.
  },
  output: 'standalone', // Vercel 배포를 위한 설정
}

module.exports = nextConfig