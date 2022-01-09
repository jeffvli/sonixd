import React, { useRef, useState } from 'react';
import md5 from 'md5';
import randomstring from 'randomstring';
import settings from 'electron-settings';
import { Form, ControlLabel, Message, RadioGroup } from 'rsuite';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import setDefaultSettings from '../shared/setDefaultSettings';
import {
  StyledButton,
  StyledCheckbox,
  StyledInput,
  StyledInputPickerContainer,
  StyledRadio,
} from '../shared/styled';
import { LoginPanel } from './styled';
import GenericPage from '../layout/GenericPage';
import logo from '../../../assets/icon.png';
import { mockSettings } from '../../shared/mockSettings';
import packageJson from '../../package.json';
import { Server } from '../../types';

const Login = () => {
  const { t } = useTranslation();
  const [serverType, setServerType] = useState('subsonic');
  const [serverName, setServerName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [legacyAuth, setLegacyAuth] = useState(false);
  const [message, setMessage] = useState('');
  const serverTypePickerRef = useRef(null);

  const handleConnect = async () => {
    setMessage('');
    const cleanServerName = serverName.replace(/\/$/, '');
    const salt = randomstring.generate({ length: 16, charset: 'alphanumeric' });
    const hash = md5(password + salt);

    try {
      const testConnection = legacyAuth
        ? await axios.get(
            `${cleanServerName}/rest/ping?v=1.13.0&c=sonixd&f=json&u=${userName}&p=${password}`
          )
        : await axios.get(
            `${cleanServerName}/rest/ping?v=1.13.0&c=sonixd&f=json&u=${userName}&s=${salt}&t=${hash}`
          );

      // Since a valid request will return a 200 response, we need to check that there
      // are no additional failures reported by the server
      if (testConnection.data['subsonic-response'].status === 'failed') {
        setMessage(`${testConnection.data['subsonic-response'].error.message}`);
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`${err.message}`);
        return;
      }
      setMessage(t('An unknown error occurred'));
      return;
    }

    localStorage.setItem('server', cleanServerName);
    localStorage.setItem('serverBase64', btoa(cleanServerName));
    localStorage.setItem('serverType', 'subsonic');
    localStorage.setItem('username', userName);
    localStorage.setItem('password', password);
    localStorage.setItem('salt', salt);
    localStorage.setItem('hash', hash);

    settings.setSync('server', cleanServerName);
    settings.setSync('serverBase64', btoa(cleanServerName));
    settings.setSync('serverType', 'subsonic');
    settings.setSync('username', userName);
    settings.setSync('password', password);
    settings.setSync('salt', salt);
    settings.setSync('hash', hash);

    // Set defaults on login
    setDefaultSettings(false);
    window.location.reload();
  };

  const handleConnectJellyfin = async () => {
    setMessage('');
    const cleanServerName = serverName.replace(/\/$/, '');
    const deviceId = randomstring.generate({ length: 12, charset: 'alphanumeric' });

    try {
      const { data } = await axios.post(
        `${cleanServerName}/users/authenticatebyname`,
        {
          Username: userName,
          Pw: password,
        },
        {
          headers: {
            'X-Emby-Authorization': `MediaBrowser Client="Sonixd", Device="PC", DeviceId="${deviceId}", Version="${packageJson.version}"`,
          },
        }
      );

      localStorage.setItem('server', cleanServerName);
      localStorage.setItem('serverBase64', btoa(cleanServerName));
      localStorage.setItem('serverType', 'jellyfin');
      localStorage.setItem('username', data.User.Id);
      localStorage.setItem('token', data.AccessToken);
      localStorage.setItem('deviceId', deviceId);

      settings.setSync('server', cleanServerName);
      settings.setSync('serverBase64', btoa(cleanServerName));
      settings.setSync('serverType', 'jellyfin');
      settings.setSync('username', data.User.Id);
      settings.setSync('token', data.AccessToken);
      settings.setSync('deviceId', deviceId);
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`${err.message}`);
        return;
      }
      setMessage(t('An unknown error occurred'));
      return;
    }

    // Set defaults on login
    setDefaultSettings(false);
    window.location.reload();
  };

  return (
    <GenericPage hideDivider>
      <LoginPanel bordered>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1>Sign in</h1>
          <img src={logo} height="80px" width="80px" alt="" />
        </span>
        <br />
        {message !== '' && <Message type="error" description={message} />}
        <Form id="login-form" fluid style={{ paddingTop: '20px' }}>
          <StyledInputPickerContainer ref={serverTypePickerRef}>
            <ControlLabel>{t('Server type')}</ControlLabel>
            <RadioGroup
              inline
              defaultValue="subsonic"
              value={serverType}
              onChange={(e: Server) => setServerType(e)}
            >
              <StyledRadio value="subsonic">Subsonic</StyledRadio>
              <StyledRadio value="jellyfin">Jellyfin</StyledRadio>
            </RadioGroup>
          </StyledInputPickerContainer>
          <br />
          <ControlLabel>{t('Server')}</ControlLabel>
          <StyledInput
            id="login-servername"
            name="servername"
            value={serverName}
            onChange={(e: string) => setServerName(e)}
            placeholder={t('Requires http(s)://')}
          />
          <br />
          <ControlLabel>{t('Username')}</ControlLabel>
          <StyledInput
            id="login-username"
            name="name"
            value={userName}
            onChange={(e: string) => setUserName(e)}
            placeholder={t('Enter username')}
          />
          <br />
          <ControlLabel>{t('Password')}</ControlLabel>
          <StyledInput
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e: string) => setPassword(e)}
            placeholder={t('Enter password')}
          />
          <br />
          {serverType !== 'jellyfin' && (
            <>
              <StyledCheckbox
                defaultChecked={
                  process.env.NODE_ENV === 'test'
                    ? mockSettings
                    : Boolean(settings.getSync('legacyAuth'))
                }
                checked={legacyAuth}
                onChange={(_v: any, e: boolean) => {
                  settings.setSync('legacyAuth', e);
                  setLegacyAuth(e);
                }}
              >
                {t('Legacy auth (plaintext)')}
              </StyledCheckbox>
              <br />
            </>
          )}
          <StyledButton
            id="login-button"
            appearance="primary"
            type="submit"
            block
            onClick={serverType !== 'jellyfin' ? handleConnect : handleConnectJellyfin}
          >
            {t('Connect')}
          </StyledButton>
        </Form>
      </LoginPanel>
    </GenericPage>
  );
};

export default Login;
