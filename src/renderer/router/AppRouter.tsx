/* eslint-disable sort-keys-fix/sort-keys-fix */
import { ReactNode } from 'react';
import isElectron from 'is-electron';
import { Routes, Route, BrowserRouter, HashRouter } from 'react-router-dom';
import { LoginRoute } from 'renderer/features/auth';
import { DashboardRoute } from 'renderer/features/dashboard';
import { ServersRoute } from 'renderer/features/servers';
import { AuthLayout, DefaultLayout } from '../layouts';
import { AuthOutlet } from './outlets/AuthOutlet';
import { PrivateOutlet } from './outlets/PrivateOutlet';
import { AppRoute } from './utils/routes';

const SelectRouter = ({ children }: { children: ReactNode }) => {
  if (isElectron()) {
    return <HashRouter>{children}</HashRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

export const AppRouter = () => {
  return (
    <>
      <SelectRouter>
        <Routes>
          <Route element={<AuthOutlet redirectTo="/" />}>
            <Route element={<AuthLayout />}>
              <Route element={<LoginRoute />} path="/login" />
            </Route>
          </Route>
          <Route element={<PrivateOutlet redirectTo="/login" />} path="/">
            <Route element={<DefaultLayout />}>
              <Route element={<DashboardRoute />} path={AppRoute.HOME} />
              <Route element={<ServersRoute />} path={AppRoute.SERVERS} />
              <Route element={<></>} path={AppRoute.SEARCH} />
              <Route element={<ServersRoute />} path="servers" />
              <Route element={<></>} path={AppRoute.LIBRARY} />
              <Route element={<></>} path="playing" />
            </Route>
            <Route element={<></>} path={AppRoute.PLAYING} />
          </Route>
        </Routes>
      </SelectRouter>
    </>
  );
};
