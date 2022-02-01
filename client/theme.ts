import { extendTheme, ThemeConfig } from "@chakra-ui/react"

const config : ThemeConfig = {
  initialColorMode: "dark",
}

const activeLabelStyles = {
  transform: 'scale(0.85) translateY(-24px) translateX(-10px)',
}

const theme = extendTheme({
  config,
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles,
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label':
            {
              ...activeLabelStyles,
            },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'gray.700',
              pointerEvents: 'none',
              mx: 3,
              px: 1,
              my: 2,
            },
          },
        },
      },
    },
  },
})

export default theme
