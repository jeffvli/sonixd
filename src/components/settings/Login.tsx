import React, { useState } from 'react';
import md5 from 'md5';
import randomstring from 'randomstring';
import settings from 'electron-settings';
import { Button, Form, ControlLabel, Message } from 'rsuite';
import axios from 'axios';
import setDefaultSettings from '../shared/setDefaultSettings';
import { StyledInput } from '../shared/styled';
import { LoginPanel } from './styled';
import GenericPage from '../layout/GenericPage';

const Login = () => {
  const [serverName, setServerName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleConnect = async () => {
    setMessage('');
    const cleanServerName = serverName.replace(/\/$/, '');
    const salt = randomstring.generate({ length: 16, charset: 'alphanumeric' });
    const hash = md5(password + salt);

    try {
      const testConnection = await axios.get(
        `${cleanServerName}/rest/getUsers?v=1.15.0&c=sonixd&f=json&u=${userName}&s=${salt}&t=${hash}`
      );

      // Since a valid request will return a 200 response, we need to check that there
      // are no additional failures reported by the server
      if (testConnection.data['subsonic-response'].status === 'failed') {
        setMessage(
          `Connection error: ${testConnection.data['subsonic-response'].error.message}`
        );
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`Connection error: ${err.message}`);
        return;
      }
      setMessage('An unknown error occurred');
      return;
    }

    localStorage.setItem('server', cleanServerName);
    localStorage.setItem('serverBase64', btoa(cleanServerName));
    localStorage.setItem('username', userName);
    localStorage.setItem('salt', salt);
    localStorage.setItem('hash', hash);

    settings.setSync('server', cleanServerName);
    settings.setSync('serverBase64', btoa(cleanServerName));
    settings.setSync('username', userName);
    settings.setSync('salt', salt);
    settings.setSync('hash', hash);

    // Set defaults on login
    setDefaultSettings(false);

    window.location.reload();
  };

  return (
    <GenericPage hideDivider>
      <LoginPanel style={{ textAlign: 'center' }}>
        <h1>Sign in to sonixd</h1>
      </LoginPanel>
      <LoginPanel bordered>
        {message !== '' && <Message type="error" description={message} />}
        <Form id="login-form" fluid style={{ paddingTop: '20px' }}>
          <ControlLabel>Server hostname</ControlLabel>
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
          <Button
            id="login-button"
            appearance="primary"
            type="submit"
            color="green"
            block
            onClick={handleConnect}
          >
            Connect
          </Button>
        </Form>
      </LoginPanel>
    </GenericPage>
  );
};

export default Login;
