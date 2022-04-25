import { useState } from 'react';

import { createStyles } from '@mantine/core';

import { controls } from './controls';
import windowsClose from './icons/close-w-10.png';
import windowsMax from './icons/max-w-10.png';
import windowsMin from './icons/min-w-10.png';

const useStyles = createStyles(() => ({
  wrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    height: '35px',
    width: '130px',
    zIndex: 200,
    WebkitAppRegion: 'no-drag',
  },
  button: {
    height: '100%',
    padding: '8px',
    flexGrow: 1,
    textAlign: 'center',
    userSelect: 'none',
    WebkitAppRegion: 'no-drag',

    '&:hover': {
      backgroundColor: 'rgba(150, 150, 150, .5)',
    },
  },
}));

interface WindowControlsProps {
  style?: 'macos' | 'windows' | 'linux';
}

const WindowControls = ({ style }: WindowControlsProps) => {
  const { classes } = useStyles();
  const [max, setMax] = useState(false);

  return (
    <>
      {style === 'windows' && (
        <>
          <div className={classes.wrapper}>
            <div
              className={classes.button}
              onClick={controls.minimize}
              role="button"
            >
              <img alt="minimize" src={windowsMin} />
            </div>
            <div
              className={classes.button}
              onClick={() => {
                if (max) {
                  controls.unmaximize();
                } else {
                  controls.maximize();
                }
                setMax(!max);
              }}
              role="button"
            >
              <img alt="maximize" src={windowsMax} />
            </div>
            <div
              className={classes.button}
              onClick={controls.close}
              role="button"
            >
              <img alt="exit" src={windowsClose} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

WindowControls.defaultProps = {
  style: 'windows',
};

export default WindowControls;
