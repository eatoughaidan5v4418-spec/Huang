import { extendTheme } from 'native-base';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF',
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
  },
  fonts: {
    heading: undefined,
    body: undefined,
    mono: undefined,
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Card: {
      baseStyle: {
        rounded: 'xl',
        shadow: '2',
      },
    },
    Input: {
      baseStyle: {
        rounded: 'lg',
      },
    },
  },
});
