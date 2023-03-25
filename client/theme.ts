import { baseTheme, extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
};

const activeLabelStyles = {
  transform: 'scale(0.85) translateY(-24px) translateX(-10px)',
};

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
    Button: {
      baseStyle: {
        paddingTop: "2px"
      },
      variants: {
        solid: ({ colorScheme }: { colorScheme: string }) => {
          if (colorScheme === "red") {
            return {
              color: "white",
              bg: "red.500",
              _hover: {
                bg: "red.400",
              },
            };
          }

          if (colorScheme === "teal") {
            return {
              color: "white",
              bg: "teal.500",
              _hover: {
                bg: 'teal.400'
              }
            }
          }
        }
      }
    }
  },
  styles: {
    global: {
      ul: {
        margin: '1rem',
        padding: '1rem',
      },
      ol: {
        margin: '1rem',
        padding: '1rem',
      },
    }
  },
  colors: {
    white: {
      100: "white",
      200: "white",
      300: "white",
      400: "white",
      500: "white",
      600: "white",
      700: "white",
      800: "white",
      900: "white",
    }
  }
});

export default theme;
