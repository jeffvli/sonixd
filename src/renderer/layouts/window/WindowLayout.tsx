import { useState } from 'react';
import isElectron from 'is-electron';
import { Outlet } from 'react-router-dom';
import { controls } from './controls';
import windowsClose from './icons/close-w-10.png';
import windowsMax from './icons/max-w-10.png';
import windowsMin from './icons/min-w-10.png';
import styles from './WindowLayout.module.scss';

interface WindowControlsProps {
  style?: 'macos' | 'windows' | 'linux';
}

export const WindowLayout = ({ style }: WindowControlsProps) => {
  const [max, setMax] = useState(false);

  return (
    <>
      {isElectron() && (
        <>
          {style === 'windows' && (
            <>
              <div className={styles.group}>
                <div
                  className={styles.button}
                  role="button"
                  onClick={controls.minimize}
                >
                  <img alt="minimize" src={windowsMin} />
                </div>
                <div
                  className={styles.button}
                  role="button"
                  onClick={() => {
                    if (max) {
                      controls.unmaximize();
                    } else {
                      controls.maximize();
                    }
                    setMax(!max);
                  }}
                >
                  <img alt="maximize" src={windowsMax} />
                </div>
                <div
                  className={styles.button}
                  role="button"
                  onClick={controls.close}
                >
                  <img alt="exit" src={windowsClose} />
                </div>
              </div>
            </>
          )}
        </>
      )}
      <Outlet />
    </>
  );
};

WindowLayout.defaultProps = {
  style: 'windows',
};
