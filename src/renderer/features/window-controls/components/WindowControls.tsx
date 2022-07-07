import { useState } from 'react';
import isElectron from 'is-electron';
import styled from 'styled-components';
import windowsClose from '../assets/close-w-10.png';
import windowsMax from '../assets/max-w-10.png';
import windowsMin from '../assets/min-w-10.png';

interface WindowControlsProps {
  style?: 'macos' | 'windows' | 'linux';
}

const WindowControlsContainer = styled.div``;

const WindowsButtonGroup = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
  display: flex;
  width: 130px;
  height: 35px;
  -webkit-app-region: no-drag;
`;

const WindowsButton = styled.div`
  flex-grow: 1;
  height: 100%;
  padding: 8px;
  text-align: center;
  user-select: none;
  -webkit-app-region: no-drag;

  &:hover {
    background: rgba(125, 125, 125, 0.3);
  }
`;

const close = () => window.electron.ipcRenderer.windowClose();

const minimize = () => window.electron.ipcRenderer.windowMinimize();

const maximize = () => window.electron.ipcRenderer.windowMaximize();

const unmaximize = () => window.electron.ipcRenderer.windowUnmaximize();

export const WindowControls = ({ style }: WindowControlsProps) => {
  const [max, setMax] = useState(false);

  const handleMinimize = () => minimize();

  const handleMaximize = () => {
    if (max) {
      unmaximize();
    } else {
      maximize();
    }
    setMax(!max);
  };

  const handleClose = () => close();

  return (
    <WindowControlsContainer>
      {isElectron() && (
        <>
          {style === 'windows' && (
            <>
              <WindowsButtonGroup>
                <WindowsButton role="button" onClick={handleMinimize}>
                  <img alt="minimize" src={windowsMin} />
                </WindowsButton>
                <WindowsButton role="button" onClick={handleMaximize}>
                  <img alt="maximize" src={windowsMax} />
                </WindowsButton>
                <WindowsButton role="button" onClick={handleClose}>
                  <img alt="exit" src={windowsClose} />
                </WindowsButton>
              </WindowsButtonGroup>
            </>
          )}
        </>
      )}
    </WindowControlsContainer>
  );
};

WindowControls.defaultProps = {
  style: 'windows',
};
