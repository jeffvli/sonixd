import React, { useState } from 'react';
import md5 from 'md5';
import randomstring from 'randomstring';
import settings from 'electron-settings';
import {
  Button,
  Panel,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Message,
} from 'rsuite';
import axios from 'axios';

const Login = () => {
  const [serverName, setServerName] = useState(
    localStorage.getItem('server') || ''
  );
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
    localStorage.setItem('username', userName);
    localStorage.setItem('salt', salt);
    localStorage.setItem('hash', hash);

    settings.setSync('server', cleanServerName);
    settings.setSync('serverBase64', btoa(cleanServerName));
    settings.setSync('username', userName);
    settings.setSync('salt', salt);
    settings.setSync('hash', hash);
    window.location.reload();
  };

  return (
    <Panel
      header="Log in to your server"
      bordered
      style={{
        padding: '30px',
        marginLeft: '28px',
        position: 'absolute',
        left: '50%',
        top: '30%',
        transform: 'translate(-50%, -50%)',
        minWidth: '400px',
      }}
    >
      {message !== '' && <Message type="error" description={message} />}
      <Form id="login-form" fluid style={{ paddingTop: '20px' }}>
        <FormGroup>
          <ControlLabel>*sonic Server</ControlLabel>
          <FormControl
            id="login-servername"
            name="servername"
            value={serverName}
            onChange={(e) => setServerName(e)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            id="login-username"
            name="name"
            value={userName}
            onChange={(e) => setUserName(e)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e)}
          />
        </FormGroup>
        <FormGroup>
          <ButtonToolbar>
            <Button
              id="login-button"
              appearance="primary"
              type="submit"
              onClick={handleConnect}
            >
              Connect
            </Button>
          </ButtonToolbar>
        </FormGroup>
      </Form>
    </Panel>
  );
};

export default Login;
