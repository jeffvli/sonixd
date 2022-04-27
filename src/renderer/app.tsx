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
    <MantineProvider>
      <ModalsProvider>
        <Router />
      </ModalsProvider>
    </MantineProvider>
  );
}
