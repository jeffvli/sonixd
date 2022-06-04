import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from 'renderer/hooks';

interface PrivateOutletProps {
  redirectTo: string;
}

export const PrivateOutlet = ({ redirectTo }: PrivateOutletProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate replace state={{ from: location }} to={redirectTo} />;
};
