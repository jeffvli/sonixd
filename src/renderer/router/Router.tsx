import { ReactNode } from 'react';
import isElectron from 'is-electron';
import { Routes, Route, BrowserRouter, HashRouter } from 'react-router-dom';
import { LoginRoute } from 'renderer/features/auth';
import { DashboardRoute } from 'renderer/features/dashboard';
import { ServersRoute } from 'renderer/features/servers';
import { AuthLayout, DefaultLayout } from '../layouts';
import { AuthOutlet } from './outlets/AuthOutlet';
import { PrivateOutlet } from './outlets/PrivateOutlet';

const SelectRouter = ({ children }: { children: ReactNode }) => {
  if (isElectron()) {
    return <HashRouter>{children}</HashRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

export const Router = () => {
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
              <Route element={<DashboardRoute />} path="/" />
              <Route element={<ServersRoute />} path="servers" />
              <Route element={<></>} path="nowplaying" />
            </Route>
          </Route>
        </Routes>
      </SelectRouter>
    </>
  );
};
