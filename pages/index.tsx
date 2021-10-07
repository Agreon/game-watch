import { Link } from '@chakra-ui/layout'
import type { NextPage } from 'next'
import React from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div style={{ position: "relative" }}>
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
        <a href="https://nextjs.org/docs" className={styles.card}>
          <h2>Documentation &rarr;</h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>
      </div>

    </div>
  )
}

export default Home
