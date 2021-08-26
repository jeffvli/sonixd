import React, { useState } from 'react';
import md5 from 'md5';
import randomstring from 'randomstring';
import settings from 'electron-settings';

import {
  Button,
  Icon,
  Container,
  Header,
  Content,
  Panel,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Alert,
} from 'rsuite';
import axios from 'axios';
import '../../styles/Settings.global.css';

const Login = () => {
  const [serverName, setServerName] = useState(
    localStorage.getItem('server') || ''
  );
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleConnect = async () => {
    console.log({
      serverName,
      userName,
      password,
    });

    const salt = randomstring.generate({ length: 16, charset: 'alphanumeric' });
    const hash = md5(password + salt);

    try {
      const testConnection = await axios.get(
        `${serverName}/rest/getUsers?v=1.15.0&c=sonixd&f=json&u=${userName}&s=${salt}&t=${hash}`
      );

      // Since a valid request will return a 200 response, we need to check that there
      // are no additional failures reported by the server
      if (testConnection.data['subsonic-response'].status === 'failed') {
        Alert.error(testConnection.data['subsonic-response'].error.message);
        return;
      }
    } catch (err) {
      Alert.error(`Error validating server hostname: ${err.message}`);
      return;
    }

    localStorage.setItem('server', serverName);
    localStorage.setItem('username', userName);
    localStorage.setItem('salt', salt);
    localStorage.setItem('hash', hash);

    settings.setSync('server', serverName);
    settings.setSync('serverBase64', btoa(serverName));
    settings.setSync('username', userName);
    settings.setSync('salt', salt);
    settings.setSync('hash', hash);

    window.location.reload();
  };

  const handleDisconnect = () => {
    localStorage.removeItem('server');
    localStorage.removeItem('username');
    localStorage.removeItem('salt');
    localStorage.removeItem('hash');
    window.location.reload();
  };

  return (
    <Container id="container__login" className="login__root">
      <Header className="login__header" />
      <Content className="login__content">
        <Panel className="login__panel" header="Server configuration" bordered>
          <Form className="login__form" fluid>
            <FormGroup>
              <ControlLabel>*sonic Server</ControlLabel>
              <FormControl
                name="servername"
                value={serverName}
                onChange={(e) => setServerName(e)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Username</ControlLabel>
              <FormControl
                name="name"
                value={userName}
                onChange={(e) => setUserName(e)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e)}
              />
            </FormGroup>

            <FormGroup>
              <ButtonToolbar>
                <Button
                  appearance="primary"
                  type="submit"
                  onClick={handleConnect}
                >
                  Connect
                </Button>
                <Button appearance="default" onClick={handleDisconnect}>
                  <Icon icon="trash" /> Delete Current Configuration
                </Button>
              </ButtonToolbar>
            </FormGroup>
          </Form>
        </Panel>
      </Content>
    </Container>
  );
};

export default Login;
