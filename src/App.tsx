import React from 'react';
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

const App = () => {
  if (!localStorage.getItem('server')) {
    return (
      <Layout disableSidebar>
        <Login />
      </Layout>
    );
  }

  return (
    <Router>
      <Layout footer={<PlayerBar />}>
        <Switch>
          <Route exact path="/library/artist/:id" component={NowPlayingView} />
          <Route exact path="/library/album/:id" component={NowPlayingView} />
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
  );
};

export default App;
