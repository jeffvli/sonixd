import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useDefaultSettings } from './features/settings';
import { Router } from './router/Router';
import './styles/global.scss';

export const App = () => {
  const [theme] = useLocalStorage({
    defaultValue: 'dark',
    key: 'theme',
  });

  useDefaultSettings();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
        defaultRadius: 'xs',
        focusRing: 'auto',
        other: {},
        spacing: {
          xs: 2,
        },
      }}
    >
      <Router />
    </MantineProvider>
  );
};
