import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import './styles/App.global.css';
import Layout from './components/layout/Layout';
import PlaylistList from './components/playlist/PlaylistList';
import PlaylistView from './components/playlist/PlaylistView';
import Settings from './components/settings/Settings';
import NowPlayingView from './components/player/NowPlayingView';
import Player from './components/player/Player';
import Login from './components/settings/Login';
import StarredView from './components/starred/StarredView';
import Dashboard from './components/dashboard/Dashboard';
import LibraryView from './components/library/LibraryView';
import PlayerBar from './components/player/PlayerBar';

const App = () => {
  if (!localStorage.getItem('server')) {
    return <Login />;
  }

  return (
    <Player>
      <Router>
        <Layout footer={<PlayerBar />}>
          <Switch>
            <Route path="/library/artist/:id" component={NowPlayingView} />
            <Route path="/library/album/:id" component={NowPlayingView} />
            <Route path="/library" component={LibraryView} />
            <Route path="/nowplaying" component={NowPlayingView} />
            <Route path="/settings" component={Settings} />
            <Route path="/playlist/:id" component={PlaylistView} />
            <Route path="/playlists" component={PlaylistList} />
            <Route path="/starred" component={StarredView} />
            <Route path="/" component={Dashboard} />
          </Switch>
        </Layout>
      </Router>
    </Player>
  );
};

export default App;
