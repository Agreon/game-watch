import { Flex } from "@chakra-ui/layout"
import { InfoSource as Source } from "../providers/GameProvider"

const SteamInfoSource: React.FC<{ source: Source }> = ({ source }) => {
    return (
        <Flex key={source.id} justifyContent="space-between">
            <a href={source.data.storeUrl as string} target="_blank" rel="noreferrer">
                {source.type}
            </a>
            <Flex>
                {source.data.priceInformation?.final ?? ""}
            </Flex>
            <div>

            </div>
        </Flex>
    )
}
/**
 * TODO:
 * - Icon for source
 * - Price
 * - Options
 */
export const InfoSource: React.FC<{ source: Source }> = ({ source }) => {
    switch (source.type) {
        case "steam":
            return <SteamInfoSource source={source} />
        case "nintendo":
        case "psStore":
        default:
            return (
                <Flex>
                    <a href={source.data.storeUrl as string} target="_blank" rel="noreferrer">
                        {source.type}
                    </a>
                </Flex>
            )
    }
}