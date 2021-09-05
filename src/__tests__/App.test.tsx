import React from 'react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { Middleware, Dispatch, AnyAction } from 'redux';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import App from '../App';

const middlewares:
  | Middleware<Record<string, unknown>, any, Dispatch<AnyAction>>[]
  | undefined = [];
const mockStore = configureMockStore(middlewares);

describe('App', () => {
  it('Should render with dark theme', () => {
    const store = mockStore({
      misc: {
        theme: 'defaultDark',
      },
    });
    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });

  it('Should render with light theme', () => {
    const store = mockStore({
      misc: {
        theme: 'defaultLight',
      },
    });
    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });

  it('Should render with no theme specified', () => {
    const store = mockStore({
      misc: {
        theme: '',
      },
    });
    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });
});
