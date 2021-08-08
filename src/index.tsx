import React from 'react';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';

import { theme } from './styles/styled';

render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <HelmetProvider>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </HelmetProvider>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
);
