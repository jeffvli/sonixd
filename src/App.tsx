import React, { useState, useEffect } from 'react';
import { webFrame } from 'electron';
import _ from 'lodash';
import { useHotkeys } from 'react-hotkeys-hook';
import settings from 'electron-settings';
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
import PlayerBar from './components/player/PlayerBar';
import AlbumView from './components/library/AlbumView';
import ArtistView from './components/library/ArtistView';
import AlbumList from './components/library/AlbumList';
import ArtistList from './components/library/ArtistList';
import GenreList from './components/library/GenreList';
import { MockFooter } from './components/settings/styled';
import { useAppSelector } from './redux/hooks';
import { PageModal } from './components/modal/Modal';
import NowPlayingMiniView from './components/player/NowPlayingMiniView';
import { GlobalContextMenu } from './components/shared/ContextMenu';
import SearchView from './components/search/SearchView';
import FolderList from './components/library/FolderList';
import { getTheme } from './shared/utils';
import { defaultDark } from './styles/styledTheme';
import { mockSettings } from './shared/mockSettings';
import MusicList from './components/library/MusicList';
import ReleaseNotes from './components/modal/ReleaseNotes';
import { notifyToast } from './components/shared/toast';

const App = () => {
  const [zoomFactor, setZoomFactor] = useState(Number(localStorage.getItem('zoomFactor')) || 1.0);
  const [theme, setTheme] = useState<any>(defaultDark);
  const [font, setFont] = useState('Poppins');
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  if (process.env.NODE_ENV !== 'test') {
    webFrame.setZoomFactor(zoomFactor);
  }

  useHotkeys(
    'ctrl+shift+=',
    (e: KeyboardEvent) => {
      e.preventDefault();
      const newZoomFactor = Math.round((zoomFactor + 0.05) * 100) / 100;
      webFrame.setZoomFactor(newZoomFactor);
      localStorage.setItem('zoomFactor', String(newZoomFactor));
      setZoomFactor(newZoomFactor);
      notifyToast('info', `${Math.round(newZoomFactor * 100)}%`);
    },
    [zoomFactor]
  );

  useHotkeys(
    'ctrl+shift+-',
    (e: KeyboardEvent) => {
      e.preventDefault();
      const newZoomFactor = Math.round((zoomFactor - 0.05) * 100) / 100;

      if (newZoomFactor > 0) {
        webFrame.setZoomFactor(newZoomFactor);
        localStorage.setItem('zoomFactor', String(newZoomFactor));
        setZoomFactor(newZoomFactor);
        notifyToast('info', `${Math.round(newZoomFactor * 100)}%`);
      }
    },
    [zoomFactor]
  );

  useEffect(() => {
    const themes: any =
      process.env.NODE_ENV === 'test'
        ? mockSettings.themesDefault
        : _.concat(settings.getSync('themes'), settings.getSync('themesDefault'));
    setTheme(getTheme(themes, misc.theme) || defaultDark);
  }, [misc.theme]);

  useEffect(() => {
    setFont(config.lookAndFeel.font);
  }, [config.lookAndFeel.font]);

  if (!localStorage.getItem('server') || !localStorage.getItem('serverBase64')) {
    return (
      <ThemeProvider theme={theme}>
        <Layout disableSidebar footer={<MockFooter />} font={font}>
          <Login />
        </Layout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout footer={<PlayerBar />} font={font}>
          <Switch>
            <Route exact path="/library/music" component={MusicList} />
            <Route exact path="/library/album" component={AlbumList} />
            <Route exact path="/library/artist" component={ArtistList} />
            <Route exact path="/library/genre" component={GenreList} />
            <Route exact path="/library/artist/:id" component={ArtistView} />
            <Route exact path="/library/artist/:id/albums" component={ArtistView} />
            <Route exact path="/library/artist/:id/compilationalbums" component={ArtistView} />
            <Route exact path="/library/artist/:id/songs" component={ArtistView} />
            <Route exact path="/library/artist/:id/topsongs" component={ArtistView} />
            <Route exact path="/library/album/:id" component={AlbumView} />
            <Route exact path="/library/folder" component={FolderList} />
            <Route exact path="/library/folder/:id" component={FolderList} />
            <Route exact path="/nowplaying" component={NowPlayingView} />
            <Route exact path="/playlist/:id" component={PlaylistView} />
            <Route exact path="/playlist" component={PlaylistList} />
            <Route exact path="/starred" component={StarredView} />
            <Route exact path="/config" component={Config} />
            <Route exact path="/search" component={SearchView} />
            <Route path="/" component={Dashboard} />
          </Switch>
        </Layout>
        <PageModal />
        <ReleaseNotes />
        <NowPlayingMiniView />
        <GlobalContextMenu />
      </Router>
    </ThemeProvider>
  );
};

export default App;
