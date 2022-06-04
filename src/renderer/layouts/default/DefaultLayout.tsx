import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import { Outlet } from 'react-router-dom';
import { PlayerBar } from 'renderer/features/playerbar';
import { Titlebar } from 'renderer/features/titlebar';
import { UserMenu } from 'renderer/features/user-menu';
import styles from './DefaultLayout.module.scss';
import { constrainSidebarWidth } from './utils/constrainSidebarWidth';

export const DefaultLayout = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(150);

  const handleResizeStart = (e: any) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleResizeEnd = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleResizeMove = useMemo(() => {
    const throttled = throttle(
      (e: MouseEvent) => setSidebarWidth(constrainSidebarWidth(e.clientX)),
      25
    );
    return (e: MouseEvent) => throttled(e);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeEnd, isResizing, handleResizeMove]);

  return (
    <>
      <div className={styles.container}>
        <div
          className={styles.main}
          style={{ gridTemplateColumns: `${sidebarWidth}px auto` }}
        >
          <div className={styles.sidebar}>
            <span
              className={clsx(styles.handle, { [styles.resizing]: isResizing })}
              role="none"
              onMouseDown={handleResizeStart}
            />
          </div>
          <div className={styles.content}>
            <Titlebar />
            <UserMenu />
            <Outlet />
          </div>
        </div>
        <div className={styles.playerbar}>
          <PlayerBar />
        </div>
      </div>
    </>
  );
};
