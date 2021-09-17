import React, { useState, useCallback, useEffect } from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { ThemeProvider } from 'styled-components';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import './styles/App.global.css';
import Layout from './components/layout/Layout';
import PlaylistList from './components/playlist/PlaylistList';
import PlaylistView from './components/playlist/PlaylistView';
import Config from './components/settings/Config';
import NowPlayingView from './components/player/NowPlayingView';
import Login from './components/settings/Login';
import StarredView from './components/starred/StarredView';
import Dashboard from './components/dashboard/Dashboard';
import LibraryView from './components/library/LibraryView';
import PlayerBar from './components/player/PlayerBar';
import AlbumView from './components/library/AlbumView';
import ArtistView from './components/library/ArtistView';
import setDefaultSettings from './components/shared/setDefaultSettings';
import AlbumList from './components/library/AlbumList';
import ArtistList from './components/library/ArtistList';
import { MockFooter } from './components/settings/styled';
import { defaultDark, defaultLight } from './styles/styledTheme';
import { useAppSelector } from './redux/hooks';
import PageModal from './components/modal/PageModal';
import NowPlayingMiniView from './components/player/NowPlayingMiniView';
import { GlobalContextMenu } from './components/shared/ContextMenu';

const keyMap = {
  FOCUS_SEARCH: 'ctrl+f',
};

const App = () => {
  const [theme, setTheme] = useState<any>(defaultDark);
  const [font, setFont] = useState('Poppins');
  const misc = useAppSelector((state) => state.misc);
  useEffect(() => {
    switch (misc.theme) {
      case 'defaultDark':
        setTheme(defaultDark);
        break;
      case 'defaultLight':
        setTheme(defaultLight);
        break;
      default:
        setTheme(defaultDark);
        break;
    }
  }, [misc.theme]);

  useEffect(() => {
    setFont(misc.font);
  }, [misc.font]);

  const focusSearchInput = useCallback(() => {
    document.getElementById('local-search-input')?.focus();
  }, []);

  if (
    !localStorage.getItem('server') ||
    !localStorage.getItem('serverBase64')
  ) {
    return (
      <ThemeProvider theme={theme}>
        <Layout disableSidebar footer={<MockFooter />} font={font}>
          <Login />
        </Layout>
      </ThemeProvider>
    );
  }

  const handlers = {
    FOCUS_SEARCH: focusSearchInput,
  };

  // Always check for default settings
  setDefaultSettings(false);

  return (
    <ThemeProvider theme={theme}>
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        <Router>
          <Layout footer={<PlayerBar />} font={font}>
            <Switch>
              <Route exact path="/library/album" component={AlbumList} />
              <Route exact path="/library/artist" component={ArtistList} />
              <Route exact path="/library/genre" component={LibraryView} />
              <Route exact path="/library/artist/:id" component={ArtistView} />
              <Route exact path="/library/album/:id" component={AlbumView} />
              <Route exact path="/folder" component={LibraryView} />
              <Route exact path="/nowplaying" component={NowPlayingView} />
              <Route exact path="/playlist/:id" component={PlaylistView} />
              <Route exact path="/playlist" component={PlaylistList} />
              <Route exact path="/starred" component={StarredView} />
              <Route exact path="/config" component={Config} />
              <Route path="/" component={Dashboard} />
            </Switch>
          </Layout>
          <PageModal />
          <NowPlayingMiniView />
          <GlobalContextMenu />
        </Router>
      </GlobalHotKeys>
    </ThemeProvider>
  );
};

export default App;
