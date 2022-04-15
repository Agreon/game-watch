import '../styles/globals.css';

import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from 'next/app';

import Layout from "../components/Layout";
import { NotificationProvider } from '../providers/NotificationProvider';
import { UserProvider } from '../providers/UserProvider';
import theme from '../theme';

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
export default MyApp;
