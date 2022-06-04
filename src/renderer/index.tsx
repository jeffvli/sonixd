import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import i18n from 'i18n/i18n';
import { App } from './app';
import { queryClient } from './lib';
import { store } from './store/store';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </I18nextProvider>
  </Provider>
);
