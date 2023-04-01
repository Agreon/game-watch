import '../styles/globals.css';

import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

import Layout from '../components/Layout';
import { GamesProvider } from '../providers/GamesProvider';
import { NotificationProvider } from '../providers/NotificationProvider';
import { TagProvider } from '../providers/TagProvider';
import { UserProvider } from '../providers/UserProvider';
import theme from '../theme';

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <NotificationProvider>
          <GamesProvider>
            <TagProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </TagProvider>
          </GamesProvider>
        </NotificationProvider>
      </UserProvider>
    </ChakraProvider>
  );
}

export default App;
