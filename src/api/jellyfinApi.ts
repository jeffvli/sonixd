import axios from 'axios';
import _ from 'lodash';
import { handleDisconnect } from '../components/settings/DisconnectButton';
import { notifyToast } from '../components/shared/toast';

const getAuth = () => {
  return {
    userId: localStorage.getItem('username') || '',
    token: localStorage.getItem('token') || '',
    server: localStorage.getItem('server') || '',
    deviceId: localStorage.getItem('deviceId') || '',
  };
};

const auth = getAuth();
const API_BASE_URL = `${auth.server}`;

export const jellyfinApi = axios.create({
  baseURL: API_BASE_URL,
});

jellyfinApi.interceptors.request.use(
  (config) => {
    const { token } = auth;

    config.headers.common['X-MediaBrowser-Token'] = token;
    // config.headers[
    //   'X-Emby-Authorization'
    // ] = `MediaBrowser Client="Sonixd", Device="PC", DeviceId="${deviceId}", Version="N/a"`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

jellyfinApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      notifyToast('warning', 'Session expired. Logging out.');
      handleDisconnect();
    }

    return Promise.reject(err);
  }
);

export const getPlaylists = async () => {
  const params = {
    SortBy: 'SortName',
    SortOrder: 'Ascending',
    IncludeItemTypes: 'Playlist',
    Recursive: true,
  };

  const playlists: any = await jellyfinApi.get(`Users/${auth.userId}/Items`, { params });
  console.log(`playlists`, playlists);

  return _.filter(playlists.Items, (item) => item.MediaType === 'Audio');
};
