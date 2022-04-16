import { Global, MantineProvider } from '@mantine/core';
import './App.css';
import Router from './Router';

export default function App() {
  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
        focusRing: 'auto',
        spacing: {
          xs: 2,
          sm: 5,
        },
        other: {
          background: '#141518',
          sidebar: '#101010',
          playerbar: '#101010',
        },
      }}
    >
      <Global
        styles={(theme) => {
          return {
            '*, *::before, *::after': {
              boxSizing: 'border-box',
            },

            body: {
              backgroundColor: theme.other.background,
              color: theme.colors.dark[0],
            },
          };
        }}
      />
      <Router />
    </MantineProvider>
  );
}
