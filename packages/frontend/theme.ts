'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#14213d', // oxford-blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#fca311', // orange-web
      contrastText: '#000000',
    },
    background: {
      default: '#EDEDED', // body background
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#14213d',
    },
    common: {
      black: '#000000',
      white: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
    h1: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#14213d',
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '8px 20px',
          fontWeight: 500,
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#14213d',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0f1a2e',
          },
        },
        containedSecondary: {
          backgroundColor: '#fca311',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#e0903f',
          },
        },
        outlined: {
          borderColor: '#fca311',
          color: '#fca311',
          '&:hover': {
            backgroundColor: '#fca311',
            color: '#ffffff',
            borderColor: '#fca311',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#cccccc',
            },
            '&:hover fieldset': {
              borderColor: '#14213d',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#fca311',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          fontWeight: 500,
          height: 'auto',
          padding: '2px 6px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          '&:hover': {
            color: '#fca311',
            backgroundColor: 'rgba(252, 163, 17, 0.1)',
          },
        },
      },
    },
  },
});

export default theme;
