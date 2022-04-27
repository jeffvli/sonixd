import { useEffect } from 'react';

import { MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';

import Router from './Router';
import './App.scss';

export default function App() {
  const [theme] = useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
        focusRing: 'auto',
        spacing: {
          xs: 2,
          sm: 4,
          md: 6,
          lg: 8,
          xl: 10,
        },
      }}
    >
      <ModalsProvider>
        <Router />
      </ModalsProvider>
    </MantineProvider>
  );
}
