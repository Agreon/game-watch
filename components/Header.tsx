import { Button, useColorMode } from '@chakra-ui/react'
import Image from 'next/image'
import githubIconLight from '../assets/github-icon-light.png'
import githubIconDark from '../assets/github-icon-dark.png'
import { Link } from '@chakra-ui/layout'

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <div style={{
            borderBottom: "1px solid grey",
            padding: "1rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Link href="/" style={{ fontSize: "1.5rem" }}>
                GameView
            </Link>
            <div style={{
                position: "absolute",
                right: "0px",
                marginRight: "1rem",
                display: "flex",
                alignItems: "center"
            }}>
                <div style={{ marginRight: "1rem", marginTop: "0.25rem" }}>
                    <a
                        href="https://github.com/Agreon/game-watch"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={colorMode === "light" ? githubIconDark : githubIconLight}
                            alt="Github"
                            width={32}
                            height={32}
                        />
                    </a>
                </div>
                <Button onClick={toggleColorMode}>
                    Toggle {colorMode === "light" ? "Dark" : "Light"}
                </Button>
            </div>
        </div>
    )
}