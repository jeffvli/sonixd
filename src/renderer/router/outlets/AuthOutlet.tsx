import { Navigate, Outlet, useLocation } from 'react-router-dom';

import useStore from '../../../store/useStore';

interface AuthOutletProps {
  redirectTo: string;
}

const AuthOutlet = ({ redirectTo }: AuthOutletProps) => {
  const location = useLocation();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={redirectTo} />;
  }

  return <Outlet />;
};

export default AuthOutlet;
