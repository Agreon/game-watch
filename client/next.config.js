const withBundleAnalyzer = (options) => {
  if (process.env.ANALYZE === 'true') {
    return require('@next/bundle-analyzer')()(options)
  } else {
    return options;
  }
}


/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
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
  }
})
