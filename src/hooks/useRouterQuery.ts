import { useLocation } from 'react-router-dom';

const useRouterQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default useRouterQuery;
