import { ColorModeScript } from "@chakra-ui/react"
import NextDocument, { Html, Head, Main, NextScript } from "next/document"
import theme from "../theme"

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
        </body>
      </Html>
    )
  }
}