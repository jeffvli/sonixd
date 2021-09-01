import React, { useCallback } from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
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

const keyMap = {
  FOCUS_SEARCH: 'ctrl+f',
};

const App = () => {
  const focusSearchInput = useCallback(() => {
    document.getElementById('local-search-input')?.focus();
  }, []);

  if (!localStorage.getItem('server')) {
    return (
      <Layout
        disableSidebar
        footer={
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'black',
              borderTop: '1px solid #48545c',
            }}
          />
        }
      >
        <Login />
      </Layout>
    );
  }

  const handlers = {
    FOCUS_SEARCH: focusSearchInput,
  };

  // Always check for default settings
  setDefaultSettings(false);

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
      <Router>
        <Layout footer={<PlayerBar />}>
          <Switch>
            <Route exact path="/library/artist/:id" component={ArtistView} />
            <Route exact path="/library/album/:id" component={AlbumView} />
            <Route exact path="/library" component={LibraryView} />
            <Route exact path="/nowplaying" component={NowPlayingView} />
            <Route exact path="/playlist/:id" component={PlaylistView} />
            <Route exact path="/playlists" component={PlaylistList} />
            <Route exact path="/starred" component={StarredView} />
            <Route exact path="/config" component={Config} />
            <Route path="/" component={Dashboard} />
          </Switch>
        </Layout>
      </Router>
    </GlobalHotKeys>
  );
};

export default App;
