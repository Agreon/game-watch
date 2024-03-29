import { ColorModeScript } from '@chakra-ui/react';
import NextDocument, { Head, Html, Main, NextScript } from 'next/document';

import theme from '../theme';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SERVER_URL} />
          <link rel="preconnect" href="https://cdn.akamai.steamstatic.com" />
          <link rel="preconnect" href="https://image.api.playstation.com" />
          <link rel="preconnect" href="https://fs-prod-cdn.nintendo-europe.com" />
          <link rel="preconnect" href="https://cdn1.epicgames.com" />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
          <script
            defer
            data-domain="game-watch.agreon.de"
            src="https://plausible.agreon.de/js/script.local.outbound-links.js">
          </script>
        </body>
      </Html>
    );
  }
}
