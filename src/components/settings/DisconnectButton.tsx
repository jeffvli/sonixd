import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../shared/styled';
import { settings } from '../shared/setDefaultSettings';

export const handleDisconnect = () => {
  localStorage.removeItem('server');
  localStorage.removeItem('username');
  localStorage.removeItem('userId');
  localStorage.removeItem('password');
  localStorage.removeItem('salt');
  localStorage.removeItem('hash');
  localStorage.removeItem('token');

  settings.set('server', '');
  settings.set('serverBase64', '');
  settings.set('username', '');
  settings.set('userId', '');
  settings.set('password', '');
  settings.set('salt', '');
  settings.set('hash', '');
  settings.set('token', '');

  // Remove the selected musicFolder on disconnect since it will cause conflicts with other servers
  settings.set('musicFolder.id', null);
  settings.set('musicFolder.name', null);
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
