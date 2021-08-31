import React, { useState } from 'react';
import fs from 'fs';
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
import { getImageCachePath, getSongCachePath } from '../../shared/utils';

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
    localStorage.setItem('username', userName);
    localStorage.setItem('salt', salt);
    localStorage.setItem('hash', hash);

    settings.setSync('server', cleanServerName);
    settings.setSync('serverBase64', btoa(cleanServerName));
    settings.setSync('username', userName);
    settings.setSync('salt', salt);
    settings.setSync('hash', hash);

    // Create the cache folders
    fs.mkdirSync(getSongCachePath(), { recursive: true });
    fs.mkdirSync(getImageCachePath(), { recursive: true });

    // Set setting defaults on first login
    if (!settings.hasSync('scrollWithCurrentSong')) {
      settings.setSync('scrollWithCurrentSong', true);
    }

    if (!settings.hasSync('cacheImages')) {
      settings.setSync('cacheImages', false);
    }

    if (!settings.hasSync('cacheSongs')) {
      settings.setSync('cacheSongs', false);
    }

    if (!settings.hasSync('fadeDuration')) {
      settings.setSync('fadeDuration', '5.0');
    }

    if (!settings.hasSync('playlistViewType')) {
      settings.setSync('playlistViewType', 'list');
    }

    if (!settings.hasSync('albumViewType')) {
      settings.setSync('albumViewType', 'list');
    }

    if (!settings.hasSync('songListFontSize')) {
      settings.setSync('songListFontSize', '14');
    }

    if (!settings.hasSync('songListRowHeight')) {
      settings.setSync('songListRowHeight', '60.0');
    }

    if (!settings.hasSync('songListColumns')) {
      settings.setSync('songListColumns', [
        {
          id: '#',
          dataKey: 'index',
          alignment: 'center',
          resizable: true,
          width: 50,
          label: '#',
        },
        {
          id: 'Title',
          dataKey: 'combinedtitle',
          alignment: 'left',
          resizable: true,
          width: 350,
          label: 'Title (Combined)',
        },
        {
          id: 'Album',
          dataKey: 'album',
          alignment: 'left',
          resizable: true,
          width: 350,
          label: 'Album',
        },
        {
          id: 'Duration',
          dataKey: 'duration',
          alignment: 'center',
          resizable: true,
          width: 100,
          label: 'Duration',
        },
      ]);
    }

    if (!settings.hasSync('albumListFontSize')) {
      settings.setSync('albumListFontSize', '14');
    }

    if (!settings.hasSync('albumListRowHeight')) {
      settings.setSync('albumListRowHeight', '60.0');
    }

    if (!settings.hasSync('albumListColumns')) {
      settings.setSync('albumListColumns', [
        {
          id: '#',
          dataKey: 'index',
          alignment: 'center',
          resizable: true,
          width: 50,
          label: '#',
        },
        {
          id: 'Title',
          dataKey: 'combinedtitle',
          alignment: 'left',
          resizable: true,
          width: 350,
          label: 'Title (Combined)',
        },
        {
          label: 'Track Count',
          value: {
            id: 'Tracks',
            dataKey: 'songCount',
            alignment: 'center',
            resizable: true,
            width: 70,
            label: 'Track Count',
          },
        },
        {
          id: 'Duration',
          dataKey: 'duration',
          alignment: 'center',
          resizable: true,
          width: 100,
          label: 'Duration',
        },
      ]);
    }
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
