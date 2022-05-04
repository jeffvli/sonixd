import { ReactNode } from 'react';

import isElectron from 'is-electron';
import { MemoryRouter, Routes, Route, BrowserRouter } from 'react-router-dom';

import { Login } from '../features/auth';
import Dashboard from '../features/dashboard/Dashboard';
import { AuthLayout, DefaultLayout, WindowLayout } from '../layouts';
import AuthOutlet from './outlets/AuthOutlet';
import PrivateOutlet from './outlets/PrivateOutlet';

const SelectRouter = ({ children }: { children: ReactNode }) => {
  if (isElectron()) {
    return <MemoryRouter>{children}</MemoryRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

const Router = () => {
  return (
    <>
      <SelectRouter>
        <Routes>
          <Route element={<WindowLayout />}>
            <Route element={<AuthOutlet redirectTo="/" />}>
              <Route element={<AuthLayout />}>
                <Route element={<Login />} path="/login" />
              </Route>
            </Route>
            <Route element={<PrivateOutlet redirectTo="/login" />} path="/">
              <Route element={<DefaultLayout />}>
                <Route element={<Dashboard />} path="" />
                <Route element={<></>} path="nowplaying" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </SelectRouter>
    </>
  );
};

export default Router;
