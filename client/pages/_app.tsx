import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from "@chakra-ui/react"
import Layout from "../components/Layout";
import theme from '../theme';
import { NotificationProvider } from '../providers/NotificationProvider';
import { UserProvider } from '../providers/UserProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <NotificationProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </NotificationProvider>
      </UserProvider>
    </ChakraProvider>
  );
}
export default MyApp
