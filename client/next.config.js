/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'fs-prod-cdn.nintendo-europe.com',
      'cdn.akamai.steamstatic.com',
      'image.api.playstation.com',
      'cdn1.epicgames.com',
      "cdn2.unrealengine.com"
    ],
    // 365 days
    minimumCacheTTL: 31536000,
  },
}
