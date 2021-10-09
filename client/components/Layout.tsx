import Head from 'next/head'
import React, { PropsWithChildren } from 'react'
import Header from './Header'


export default function Layout({ children }: PropsWithChildren<{}>) {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "scroll"
            }}
        >
            <Head>
                <title>GameWatch</title>
                <meta name="description" content="Overview of game release dates, prices and news" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main style={{ padding: "2rem", marginTop: "4rem" }}>{children}</main>
            <footer style={{
                position: "absolute",
                bottom: "0px",
                left: "0px",
                borderTop: "1px solid #eaeaea",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                padding: "1rem",
                backgroundColor: "var(--chakra-colors-gray-800)"
            }}>
                <a
                    href="https://github.com/Agreon"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Made by <b>Agreon</b>
                </a>
            </footer>
        </div>
    )
}