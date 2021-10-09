import type { NextPage } from 'next'
import React from 'react'
import styles from '../styles/Home.module.css'
import axios from "axios";
import { Box, Flex } from "@chakra-ui/layout";

import { Game, GameProvider } from '../providers/GameProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGame } from '../components/AddGame';

const Home: NextPage<{ games: Game[] }> = ({ games }) => {
  return (
    <GameProvider initialGames={games}>
      <Box>
        <Box style={{ left: "auto", right: "auto", width: "100%", marginBottom: "2rem" }}>
          <h1 className={styles.title}>
            Welcome to GameWatch!
          </h1>

          <p className={styles.description}>
            To get started, add a new game to watch:
          </p>
        </Box>

        <Flex justifyContent="center">
          <Box width="50%">
            <AddGame />
          </Box>
        </Flex>
        <GameGrid />
      </Box>
    </GameProvider>
  )
}

export async function getServerSideProps() {
  const { data } = await axios.get("http://localhost:3002/game");

  return {
    props: {
      games: data
    }
  }
}


export default Home
