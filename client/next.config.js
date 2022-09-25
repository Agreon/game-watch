const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const moduleExports = {
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

  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,
  },
}


const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  // silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)