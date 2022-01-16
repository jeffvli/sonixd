import React from 'react';
import settings from 'electron-settings';
import { useTranslation } from 'react-i18next';
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

  // Remove the selected musicFolder on disconnect since it will cause conflicts with other servers
  settings.setSync('musicFolder.id', null);
  settings.setSync('musicFolder.name', null);
  window.location.reload();
};

const DisconnectButton = () => {
  const { t } = useTranslation();
  return (
    <StyledButton onClick={handleDisconnect} size="sm">
      {t('Disconnect')}
    </StyledButton>
  );
};

export default DisconnectButton;
