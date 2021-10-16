import type { GetServerSidePropsContext, NextPage } from 'next'
import React from 'react'
import axios from "axios";
import { Text } from "@chakra-ui/react";
import { Box, Flex } from "@chakra-ui/layout";
import initializeBasicAuth from 'nextjs-basic-auth'

import { Game, GameProvider } from '../providers/GameProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGame } from '../components/AddGame';


const Home: NextPage<{ games: Game[] }> = ({ games }) => {
  return (
    <GameProvider initialGames={games}>
      <Box>
        {games.length === 0 &&
          <Box textAlign="center" mb="2rem">
          <Text fontSize="4xl">Welcome to GameWatch!</Text>

          <Text fontSize="2xl">
            To get started, add a new game to watch:
          </Text>
        </Box>
        }

        <Flex justify="center">
          <Box width={["80%", "80%", "80%", "30%"]} ml={["0rem", "0rem", "0rem", "6rem"]}>
            <AddGame />
          </Box>
        </Flex>
        <GameGrid />
      </Box>
    </GameProvider>
  )
}

axios.defaults.baseURL = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`;

const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;
const basicAuthCheck = initializeBasicAuth({
  users: [{ user: 'admin', password: basicAuthPassword! },]
})

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  if (basicAuthPassword) {
    basicAuthCheck(req, res);
  }

  const { data } = await axios.get('/game');

  return {
    props: {
      games: data
    }
  }
}


export default Home
