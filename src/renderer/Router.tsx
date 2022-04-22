import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './features/dashboard/Dashboard';
import { DefaultLayout } from './layouts';

const Router = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

export default Router;
