import React, { useRef, useState } from 'react';
import md5 from 'md5';
import randomstring from 'randomstring';
import settings from 'electron-settings';
import { Button, Form, ControlLabel, Message } from 'rsuite';
import axios from 'axios';
import setDefaultSettings from '../shared/setDefaultSettings';
import {
  StyledCheckbox,
  StyledInput,
  StyledInputPicker,
  StyledInputPickerContainer,
} from '../shared/styled';
import { LoginPanel } from './styled';
import GenericPage from '../layout/GenericPage';
import logo from '../../../assets/icon.png';
import { mockSettings } from '../../shared/mockSettings';
import packageJson from '../../package.json';

const Login = () => {
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
            `${cleanServerName}/rest/getScanStatus?v=1.15.0&c=sonixd&f=json&u=${userName}&p=${password}`
          )
        : await axios.get(
            `${cleanServerName}/rest/getScanStatus?v=1.15.0&c=sonixd&f=json&u=${userName}&s=${salt}&t=${hash}`
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
      setMessage('An unknown error occurred');
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
      setMessage('An unknown error occurred');
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
            <ControlLabel>Server type</ControlLabel>
            <StyledInputPicker
              container={() => serverTypePickerRef.current}
              cleanable={false}
              data={[
                { label: 'Subsonic', value: 'subsonic' },
                { label: 'Jellyfin', value: 'jellyfin' },
              ]}
              defaultValue="subsonic"
              valueKey="value"
              labelKey="label"
              onChange={(e: 'subsonic' | 'jellyfin') => setServerType(e)}
            />
          </StyledInputPickerContainer>
          <br />
          <ControlLabel>Server</ControlLabel>
          <StyledInput
            id="login-servername"
            name="servername"
            value={serverName}
            onChange={(e: string) => setServerName(e)}
          />
          <br />
          <ControlLabel>Username</ControlLabel>
          <StyledInput
            id="login-username"
            name="name"
            value={userName}
            onChange={(e: string) => setUserName(e)}
          />
          <br />
          <ControlLabel>Password</ControlLabel>
          <StyledInput
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e: string) => setPassword(e)}
          />
          <br />
          {serverType === 'subsonic' && (
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
                Legacy auth (plaintext)
              </StyledCheckbox>
              <br />
            </>
          )}
          <Button
            id="login-button"
            appearance="primary"
            type="submit"
            color="green"
            block
            onClick={serverType === 'subsonic' ? handleConnect : handleConnectJellyfin}
          >
            Connect
          </Button>
        </Form>
      </LoginPanel>
    </GenericPage>
  );
};

export default Login;
