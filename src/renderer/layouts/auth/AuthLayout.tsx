import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.scss';

export const AuthLayout = () => {
  return (
    <>
      <div className={styles.window} />
      <div className={styles.container}>
        <Outlet />
      </div>
    </>
  );
};
