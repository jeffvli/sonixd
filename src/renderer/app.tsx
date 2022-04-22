import { useEffect, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import Router from './Router';
import { dark } from './themes';
import base from './themes/base';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState<any>(base);

  useEffect(() => {
    setTheme(dark);
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Router />
    </MantineProvider>
  );
}
