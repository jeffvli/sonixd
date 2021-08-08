import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { useAppSelector } from './redux/hooks';
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

const queryClient = new QueryClient();

const App = () => {
  const playQueue = useAppSelector((state: any) => state.playQueue);
  if (!localStorage.getItem('server')) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {playQueue.entry.length <= 1 && (
        <Helmet>
          <title>sonicd</title>
        </Helmet>
      )}

      {playQueue.entry[playQueue.currentIndex] && (
        <Helmet>
          <title>
            {playQueue.entry[playQueue.currentIndex].title} {' by '}
            {playQueue.entry[playQueue.currentIndex].artist} — sonicd
          </title>
        </Helmet>
      )}
      <Router>
        <Layout>
          <Switch>
            <Route path="/album/:id" component={NowPlayingView} />
            <Route path="/nowplaying" component={NowPlayingView} />
            <Route path="/settings" component={Settings} />
            <Route path="/playlist/:id" component={PlaylistView} />
            <Route path="/playlists" component={PlaylistList} />
            <Route path="/starred" component={StarredView} />
            <Route path="/" component={Dashboard} />
          </Switch>
        </Layout>
      </Router>
      <Player />
    </QueryClientProvider>
  );
};

export default App;
