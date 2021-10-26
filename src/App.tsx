import React, { useState, useEffect } from 'react';
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
import { defaultDark, defaultLight } from './styles/styledTheme';
import { useAppSelector } from './redux/hooks';
import PageModal from './components/modal/PageModal';
import NowPlayingMiniView from './components/player/NowPlayingMiniView';
import { GlobalContextMenu } from './components/shared/ContextMenu';
import SearchView from './components/search/SearchView';
import FolderList from './components/library/FolderList';

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
            <Route exact path="/library/album" component={AlbumList} />
            <Route exact path="/library/artist" component={ArtistList} />
            <Route exact path="/library/genre" component={GenreList} />
            <Route exact path="/library/artist/:id" component={ArtistView} />
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
        <NowPlayingMiniView />
        <GlobalContextMenu />
      </Router>
    </ThemeProvider>
  );
};

export default App;
