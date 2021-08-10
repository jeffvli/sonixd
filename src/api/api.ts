import axios from 'axios';
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
  config.params.c = 'sonixd';
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

const getCoverArtUrl = (item: any, size = 200) => {
  if (!item.coverArt) {
    return 'img/placeholder.jpg';
  }

  return (
    `${API_BASE_URL}/getCoverArt` +
    `?id=${item.coverArt}` +
    `&u=${auth.username}` +
    `&s=${auth.salt}` +
    `&t=${auth.hash}` +
    `&v=1.15.0` +
    `&c=sonixd` +
    `&size=${size}`
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
    `&c=sonixd`
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
    entry: (data.playlist.entry || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      index,
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
  return data;
};

export const getDownload = async (id: string) => {
  const { data } = await api.get(`/download?id=${id}`);
  return data;
};

export const getPlayQueue = async () => {
  const { data } = await api.get(`/getPlayQueue`);
  return {
    ...data.playQueue,
    entry: (data.playQueue.entry || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      index,
    })),
  };
};

export const getStarred = async () => {
  const { data } = await api.get(`/getStarred2`);
  return {
    ...data.starred2,
    album: (data.starred2.album || []).map((entry: any, index: any) => ({
      ...entry,
      image: getCoverArtUrl(entry),
      index,
    })),
    song: (data.starred2.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      image: getCoverArtUrl(entry),
      index,
    })),
  };
};

export const getAlbums = async (options: any, coverArtSize = 150) => {
  const { data } = await api.get(`/getAlbumList2`, {
    params: options,
  });

  return {
    ...data.albumList2,
    album: (data.albumList2.album || []).map((entry: any, index: any) => ({
      ...entry,
      image: getCoverArtUrl(entry, coverArtSize),
      index,
    })),
  };
};

export const getAlbumsDirect = async (options: any, coverArtSize = 150) => {
  const { data } = await api.get(`/getAlbumList2`, {
    params: options,
  });

  const albums = (data.albumList2.album || []).map(
    (entry: any, index: any) => ({
      ...entry,
      image: getCoverArtUrl(entry, coverArtSize),
      index,
    })
  );

  return albums;
};

export const getAlbum = async (id: string, coverArtSize = 150) => {
  const { data } = await api.get(`/getAlbum`, {
    params: {
      id,
    },
  });

  return {
    ...data.album,
    song: (data.album.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      image: getCoverArtUrl(entry, coverArtSize),
      index,
    })),
  };
};

export const getRandomSongs = async (options: any, coverArtSize = 150) => {
  const { data } = await api.get(`/getRandomSongs`, {
    params: options,
  });

  return {
    ...data.randomSongs,
    song: (data.randomSongs.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      image: getCoverArtUrl(entry, coverArtSize),
      index,
    })),
  };
};

export const getArtists = async () => {
  const { data } = await api.get(`/getArtists`);

  const artistList: any[] = [];
  const artists = (data.artists?.index || []).flatMap(
    (index: any) => index.artist
  );

  artists.map((artist: any) =>
    artistList.push({ ...artist, image: getCoverArtUrl(artist, 150) })
  );

  return artistList;
};
