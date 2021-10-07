import { Link } from '@chakra-ui/layout'
import type { NextPage } from 'next'
import React, { useCallback, useState } from 'react'
import styles from '../styles/Home.module.css'
import axios from "axios";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";

interface Game {
  id: string;
  name: string;
}

const Home: NextPage<{ games: Game[] }> = ({ games: initialGames }) => {
  const [games, setGames] = useState(initialGames);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const createGame = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.post<any>("http://localhost:3002/game", { search: name });

      setGames([data, ...games]);
    } catch (e) {

    } finally {
      setLoading(false);
    }
  }, [name, games, setGames, setLoading])

  const onNameKeyPress = useCallback(async ({ key }) => {
    if (!loading && key === "Enter") {
      await createGame();
    }
  }, [loading, createGame]);

  return (
    <div style={{ position: "relative" }}>
      <FormControl id="name">
        <FormLabel>Name</FormLabel>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyPress={onNameKeyPress}
          placeholder="Name of the game"
          size="lg"
        />
      </FormControl>


      <div style={{ position: "absolute", left: "auto", right: "auto", width: "100%" }}>

        <h1 className={styles.title}>
          Welcome to GameView!
        </h1>

        <p className={styles.description}>
          Get started:{" "}
          <Link href="/add"><b>Add a new game</b></Link>
          {" "}
          to watch
        </p>
      </div>

      <div className={styles.grid}>

        {games.map(game => (
          <a key={game.id} href="https://nextjs.org/docs" className={styles.card}>
            <h2>{game.name}</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>
        ))}

        <a href="https://nextjs.org/docs" className={styles.card}>
          <h2>Documentation &rarr;</h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>
      </div>

    </div>
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
