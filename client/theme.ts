import { extendTheme, ThemeConfig } from "@chakra-ui/react"
import type { GlobalStyleProps } from '@chakra-ui/theme-tools';
import { mode } from '@chakra-ui/theme-tools';

/*
* Color:
* rgb(49, 151, 149)
* rgb(129, 230, 217)
*/

const config : ThemeConfig = {
  initialColorMode: "dark",
}

const components = {
  Button: {
    solid: (props: GlobalStyleProps) => ({
      bg: 'yellow.500',
      // bg: mode('yellow.500', 'yellow.500')(props),
      hoverBg: mode('yellow.600', 'yellow.600')(props),
      activeBg: mode('yellow.700', 'yellow.700')(props),
      _hover: {
        bg: mode("yellow.300", `yellow.300`)(props),
        _disabled: {
          bg: "yellow.300",
        },
      },
      _active: { bg: mode("yellow.400", `yellow.400`)(props) },
    }),
  }
};

const colors = {
  red: {
    50: "#FFF5F5",
    100: "#FED7D7",
    200: "#FEB2B2",
    300: "#FC8181",
    400: "#F56565",
    500: "#E53E3E",
    600: "#C53030",
    700: "#9B2C2C",
    800: "#822727",
    900: "#63171B",
  },
  teal: {
    50: "#E6FFFA",
    100: "#B2F5EA",
    200: "#81E6D9",
    300: "#4FD1C5",
    400: "#38B2AC",
    500: "#319795",
    600: "#2C7A7B",
    700: "#285E61",
    800: "#234E52",
    900: "#1D4044",
  }
}

const theme = extendTheme({
  config,
  components,
  colors,
})


export default theme