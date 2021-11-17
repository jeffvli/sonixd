import React from 'react';
import settings from 'electron-settings';
import { StyledButton } from '../shared/styled';

export const handleDisconnect = () => {
  localStorage.removeItem('server');
  localStorage.removeItem('username');
  localStorage.removeItem('userId');
  localStorage.removeItem('password');
  localStorage.removeItem('salt');
  localStorage.removeItem('hash');
  localStorage.removeItem('token');

  settings.setSync('server', '');
  settings.setSync('serverBase64', '');
  settings.setSync('username', '');
  settings.setSync('userId', '');
  settings.setSync('password', '');
  settings.setSync('salt', '');
  settings.setSync('hash', '');
  settings.setSync('token', '');
  window.location.reload();
};

const DisconnectButton = () => {
  return (
    <StyledButton onClick={handleDisconnect} size="sm">
      Disconnect
    </StyledButton>
  );
};

export default DisconnectButton;
