const withBundleAnalyzer = (options) => {
  if (process.env.ANALYZE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@next/bundle-analyzer')()(options);
  } else {
    return options;
  }
};

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  compress: false,
  images: {
    domains: [
      'fs-prod-cdn.nintendo-europe.com',
      'cdn.akamai.steamstatic.com',
      'steamcdn-a.akamaihd.net',
      'image.api.playstation.com',
      'cdn1.epicgames.com',
      'cdn2.unrealengine.com'
    ],
    // 365 days
    minimumCacheTTL: 31536000,
  }
});
