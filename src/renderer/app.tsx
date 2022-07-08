import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useDefaultSettings } from './features/settings';
import { AppRouter } from './router/AppRouter';
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
        fontSizes: {
          lg: 16,
          md: 14,
          sm: 12,
          xl: 18,
          xs: 10,
        },
        other: {},
        spacing: {
          xs: 2,
        },
      }}
    >
      <AppRouter />
    </MantineProvider>
  );
};
