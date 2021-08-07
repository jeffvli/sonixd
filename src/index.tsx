import React from 'react';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';

render(
  <Provider store={store}>
    <HelmetProvider>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </HelmetProvider>
  </Provider>,
  document.getElementById('root')
);
