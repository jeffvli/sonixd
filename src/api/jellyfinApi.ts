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

const normalizeItem = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
  };
};

const normalizeSong = (item: any) => {
  return {
    id: item.Id,
    parent: undefined,
    isDir: item.IsFolder,
    title: item.Name,
    album: item.Album,
    albumId: item.AlbumId,
    artist: item.ArtistItems && item.ArtistItems.map((entry: any) => normalizeItem(entry)),
    albumArtist: item.AlbumArtists && item.AlbumArtists[0]?.Name,
    albumArtistId: item.AlbumArtists && item.AlbumArtists[0]?.Id,
    track: item.IndexNumber,
    year: item.ProductionYear,
    genre: item.GenreItems && item.GenreItems.map((entry: any) => normalizeItem(entry)),
    albumGenre: item.GenreItems && item.GenreItems[0]?.Name,
    size: item.MediaSources && item.MediaSources.Size,
    contentType: undefined,
    suffix: undefined,
    duration: item.RunTimeTicks / 10000000,
    bitRate: item.MediaSources && item.MediaSources.MediaStreams?.BitRate,
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

const normalizeAlbum = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    albumId: item.Id,
    artist: item.ArtistItems && item.ArtistItems.map((entry: any) => normalizeItem(entry)),
    albumArtist: item.AlbumArtists && item.AlbumArtists[0]?.Name,
    albumArtistId: item.AlbumArtists && item.AlbumArtists[0]?.Id,
    songCount: item.ChildCount,
    duration: item.RunTimeTicks / 10000000,
    created: item.DateCreated,
    year: item.ProductionYear,
    genre: item.GenreItems && item.GenreItems.map((entry: any) => normalizeItem(entry)),
    image: getCoverArtUrl(item, 350),
    isDir: false,
    starred: item.UserData.IsFavorite ? 'true' : undefined,
    type: Item.Album,
    uniqueId: nanoid(),
    song: (item.song || []).map((entry: any) => normalizeSong(entry)),
  };
};

const normalizePlaylist = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    comment: undefined,
    owner: undefined,
    public: undefined,
    songCount: item.ChildCount,
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
    params: { ids: options.id, UserId: auth.username, fields: 'DateCreated, ChildCount' },
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
      fields: 'DateCreated, ChildCount',
      recursive: true,
    },
  });

  return (_.filter(data.Items, (item) => item.MediaType === 'Audio') || []).map((entry) =>
    normalizePlaylist(entry)
  );
};

export const getAlbum = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items/${options.id}`, {
    params: {
      fields: 'Genres, DateCreated, ChildCount',
    },
  });

  const { data: songData } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      parentId: options.id,
      sortBy: 'SortName',
      fields: 'Genres',
    },
  });

  return normalizeAlbum({ ...data, song: songData.Items });
};

export const getAlbums = async (options: {
  type: any;
  size: number;
  offset: number;
  recursive: boolean;
}) => {
  const sortTypes = [
    { original: 'alphabeticalByName', replacement: 'SortName', sortOrder: 'Ascending' },
    { original: 'alphabeticalByArtist', replacement: 'Artist', sortOrder: 'Ascending' },
    { original: 'frequent', replacement: 'PlayCount', sortOrder: 'Ascending' },
    { original: 'random', replacement: 'Random', sortOrder: 'Ascending' },
    { original: 'newest', replacement: 'DateCreated', sortOrder: 'Descending' },
    { original: 'recent', replacement: 'DatePlayed', sortOrder: 'Descending' },
  ];

  const sortType = sortTypes.find((type) => type.original === options.type);

  if (options.recursive) {
    const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
      params: {
        sortBy: sortType!.replacement,
        sortOrder: sortType!.sortOrder,
        includeItemTypes: 'MusicAlbum',
        fields: 'Genres, DateCreated, ChildCount',
        recursive: true,
      },
    });

    return (data.Items || []).map((entry: any) => normalizeAlbum(entry));
  }

  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      sortBy: sortType!.replacement,
      sortOrder: sortType!.sortOrder,
      includeItemTypes: 'MusicAlbum',
      fields: 'Genres, DateCreated, ChildCount',
      recursive: true,
      limit: options.size,
      offset: options.offset,
    },
  });

  return (data.Items || []).map((entry: any) => normalizeAlbum(entry));
};

// http://192.168.14.11:8096/Users/0e5716f27d7f4b48aadb4a3bd55a38e9/Items/70384e0059a925138783c7275f717859
