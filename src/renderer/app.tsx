import { useEffect } from 'react';

import { MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

import Router from './router/Router';
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
        defaultRadius: 'xs',
        spacing: {
          xs: 2,
        },
        other: {},
      }}
    >
      <Router />
    </MantineProvider>
  );
}
