import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from 'renderer/hooks';

interface AuthOutletProps {
  redirectTo: string;
}

export const AuthOutlet = ({ redirectTo }: AuthOutletProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={redirectTo} />;
  }

  return <Outlet />;
};
