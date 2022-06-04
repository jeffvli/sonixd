import { Outlet } from 'react-router-dom';
import { Titlebar } from 'renderer/features/titlebar';
import styles from './AuthLayout.module.scss';

export const AuthLayout = () => {
  return (
    <>
      <div className={styles.window}>
        <Titlebar />
      </div>
      <div className={styles.container}>
        <Outlet />
      </div>
    </>
  );
};
