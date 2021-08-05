import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Helmet } from 'react-helmet-async';

import './styles/App.global.css';
import Layout from './components/layout/Layout';
import PlaylistList from './components/playlist/PlaylistList';
import PlaylistView from './components/playlist/PlaylistView';
import Settings from './components/settings/Settings';
import NowPlayingView from './components/player/NowPlayingView';
import Player from './components/player/Player';
import Login from './components/settings/Login';
import StarredView from './components/starred/StarredView';

const queryClient = new QueryClient();

const App = () => {
  if (!localStorage.getItem('server')) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>sonicd</title>
      </Helmet>
      <Router>
        <Layout>
          <Switch>
            <Route path="/nowplaying" component={NowPlayingView} />
            <Route path="/settings" component={Settings} />
            <Route path="/playlist/:id" component={PlaylistView} />
            <Route path="/playlists" component={PlaylistList} />
            <Route path="/starred" component={StarredView} />
            <Route path="/" />
          </Switch>
        </Layout>
      </Router>
      <Player />
    </QueryClientProvider>
  );
};

export default App;
