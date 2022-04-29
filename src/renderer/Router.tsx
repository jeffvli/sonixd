import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { Login } from './features/auth';
import Dashboard from './features/dashboard/Dashboard';
import { AuthLayout, DefaultLayout, WindowLayout } from './layouts';

const Router = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route element={<WindowLayout />}>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route element={<Login />} path="/" />
          </Route>

          {/* Protected Routes */}
          <Route element={<DefaultLayout />}>
            <Route element={<Dashboard />} path="/dashboard" />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

export default Router;
