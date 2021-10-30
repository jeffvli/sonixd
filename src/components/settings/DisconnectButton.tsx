import React from 'react';
import settings from 'electron-settings';
import { StyledButton } from '../shared/styled';

const DisconnectButton = () => {
  const handleDisconnect = () => {
    localStorage.removeItem('server');
    localStorage.removeItem('username');
    localStorage.removeItem('salt');
    localStorage.removeItem('hash');

    settings.setSync('server', '');
    settings.setSync('serverBase64', '');
    settings.setSync('username', '');
    settings.setSync('salt', '');
    settings.setSync('hash', '');
    window.location.reload();
  };
  return (
    <StyledButton onClick={handleDisconnect} size="sm">
      Disconnect
    </StyledButton>
  );
};

export default DisconnectButton;
