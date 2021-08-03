import React from 'react';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import './styles/App.global.css';
import Layout from './components/layout/Layout';
import PlaylistList from './components/playlist/PlaylistList';
import PlaylistView from './components/playlist/PlaylistView';
import Settings from './components/settings/Settings';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Switch>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/playlist/:id">
              <PlaylistView />
            </Route>
            <Route path="/playlists">
              <PlaylistList />
            </Route>
            <Route path="/">Main route</Route>
          </Switch>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
