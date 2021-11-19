import axios from 'axios';
import _ from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import { handleDisconnect } from '../components/settings/DisconnectButton';
import { notifyToast } from '../components/shared/toast';
import { Item } from '../types';

const getAuth = () => {
  return {
    username: localStorage.getItem('username') || '',
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

const getStreamUrl = (id: string) => {
  return (
    `${API_BASE_URL}/Audio` +
    `/${id}` +
    `/universal` +
    `?UserId=${auth.username}` +
    `&DeviceId=${auth.deviceId}` +
    `&AudioCodec=aac` +
    `&api_key=${auth.token}` +
    `&PlaySessionId=${auth.deviceId}` +
    `&Container=['opus','mp3','aac','m4a','m4b','flac','wav','ogg']`
  );
};

const getCoverArtUrl = (item: any, size?: number) => {
  if (!item.ImageTags?.Primary) {
    return 'img/placeholder.jpg';
  }

  return (
    `${API_BASE_URL}/Items` +
    `/${item.Id}` +
    `/Images/Primary` +
    `?width=${size}` +
    `&height=${size}`
  );
};

const normalizeSong = (item: any) => {
  return {
    id: item.Id,
    parent: undefined,
    isDir: item.isFolder,
    title: item.Name,
    album: item.Album,
    albumId: item.AlbumId,
    artist: item?.ArtistItems[0]?.Name,
    artistId: item?.ArtistItems[0]?.Id,
    track: item.IndexNumber,
    year: item.ProductionYear,
    genre: item.GenreItems && item?.GenreItems[0]?.Name,
    size: item.MediaSources?.Size,
    contentType: undefined,
    suffix: undefined,
    duration: item.RunTimeTicks / 10000000,
    bitRate: item.MediaSources?.MediaStreams?.BitRate,
    path: item.Path,
    playCount: item.UserData.PlayCount,
    discNumber: undefined,
    created: item.DateCreated,
    streamUrl: getStreamUrl(item.Id),
    image: getCoverArtUrl(item, 150),
    starred: item.UserData.isFavorite ? 'true' : undefined,
    type: Item.Music,
    uniqueId: nanoid(),
  };
};

const normalizePlaylist = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    comment: undefined,
    owner: undefined,
    public: undefined,
    songCount: item.SongCount,
    duration: item.RunTimeTicks / 10000000,
    created: item.DateCreated,
    changed: item.DateLastMediaAdded,
    image: getCoverArtUrl(item, 350),
    type: Item.Playlist,
    uniqueId: nanoid(),
    song: [],
  };
};

export const getPlaylist = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/Items`, {
    params: { ids: options.id, UserId: auth.username, fields: 'DateCreated' },
  });

  const { data: songData } = await jellyfinApi.get(`/Playlists/${options.id}/Items`, {
    params: { UserId: auth.username },
  });

  return {
    ...normalizePlaylist(data.Items[0]),
    songCount: songData.Items.length,
    song: (songData.Items || []).map((entry: any) => normalizeSong(entry)),
  };
};

export const getPlaylists = async () => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      sortBy: 'SortName',
      sortOrder: 'Ascending',
      includeItemTypes: 'Playlist',
      fields: 'DateCreated',
      recursive: true,
    },
  });

  return (_.filter(data.Items, (item) => item.MediaType === 'Audio') || []).map((entry) =>
    normalizePlaylist(entry)
  );
};
