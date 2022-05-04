import { Navigate, Outlet, useLocation } from 'react-router-dom';

import useStore from '../../../store/useStore';

interface PrivateOutletProps {
  redirectTo: string;
}

const PrivateOutlet = ({ redirectTo }: PrivateOutletProps) => {
  const location = useLocation();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate replace state={{ from: location }} to={redirectTo} />;
};

export default PrivateOutlet;
