import { ReactNode } from 'react';
import isElectron from 'is-electron';
import { MemoryRouter, Routes, Route, BrowserRouter } from 'react-router-dom';
import { LoginRoute } from 'renderer/features/auth';
import { DashboardRoute } from 'renderer/features/dashboard';
import { AuthLayout, DefaultLayout, WindowLayout } from '../layouts';
import { AuthOutlet } from './outlets/AuthOutlet';
import { PrivateOutlet } from './outlets/PrivateOutlet';

const SelectRouter = ({ children }: { children: ReactNode }) => {
  if (isElectron()) {
    return <MemoryRouter>{children}</MemoryRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

export const Router = () => {
  return (
    <>
      <SelectRouter>
        <Routes>
          <Route element={<WindowLayout />}>
            <Route element={<AuthOutlet redirectTo="/" />}>
              <Route element={<AuthLayout />}>
                <Route element={<LoginRoute />} path="/login" />
              </Route>
            </Route>
            <Route element={<PrivateOutlet redirectTo="/login" />} path="/">
              <Route element={<DefaultLayout />}>
                <Route element={<DashboardRoute />} path="" />
                <Route element={<></>} path="nowplaying" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </SelectRouter>
    </>
  );
};
