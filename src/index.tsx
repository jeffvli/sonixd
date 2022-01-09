import React from 'react';
import settings from 'electron-settings';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './redux/store';
import './i18n/i18n';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

settings.configure({
  prettify: true,
  numSpaces: 2,
});

render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </QueryClientProvider>
  </Provider>,
  document.getElementById('root')
);
