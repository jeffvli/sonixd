import axios from 'axios';
import { formatSongDuration } from '../shared/utils';
import getAuth from './auth';

const auth = getAuth();
const API_BASE_URL = `${auth.server}/rest`;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.u = auth.username;
  config.params.s = auth.salt;
  config.params.t = auth.hash;
  config.params.v = '1.15.0';
  config.params.c = 'sonicd';
  config.params.f = 'json';
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Return the subsonic response directly
    res.data = res.data['subsonic-response'];
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);

const getCoverArtUrl = (item: any) => {
  if (!item.coverArt) {
    return undefined;
  }

  return (
    `${API_BASE_URL}/getCoverArt` +
    `?id=${item.coverArt}` +
    `&u=${auth.username}` +
    `&s=${auth.salt}` +
    `&t=${auth.hash}` +
    `&v=1.15.0` +
    `&c=sonicd` +
    `&size=200`
  );
};

const getStreamUrl = (id: string) => {
  return (
    `${API_BASE_URL}/stream` +
    `?id=${id}` +
    `&u=${auth.username}` +
    `&s=${auth.salt}` +
    `&t=${auth.hash}` +
    `&v=1.15.0` +
    `&c=sonicd`
  );
};

export const getPlaylists = async () => {
  const { data } = await api.get('/getPlaylists');

  return (data.playlists?.playlist || []).map((playlist: any) => ({
    ...playlist,
    name: playlist.name,
    image: playlist.songCount > 0 ? getCoverArtUrl(playlist) : undefined,
  }));
};

export const getPlaylist = async (id: string) => {
  const { data } = await api.get(`/getPlaylist?id=${id}`);
  return {
    ...data.playlist,
    entry: data.playlist.entry.map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      duration: formatSongDuration(entry.duration),
      index: index + 1,
    })),
    image:
      data.playlist.songCount > 0 ? getCoverArtUrl(data.playlist) : undefined,
  };
};

export const getPing = async () => {
  const { data } = await api.get(`/ping`);

  return data;
};

export const getStream = async (id: string) => {
  const { data } = await api.get(`/stream?id=${id}`);
  console.log(data);
  return data;
};
