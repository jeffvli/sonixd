/* eslint-disable no-await-in-loop */
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { nanoid } from 'nanoid/non-secure';
import { handleDisconnect } from '../components/settings/DisconnectButton';
import { notifyToast } from '../components/shared/toast';
import { GenericItem, Item, Song } from '../types';

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

export const getDownloadUrl = (options: { id: string }) => {
  return `${API_BASE_URL}/items/${options.id}/download?api_key=${auth.token}`;
};

const normalizeItem = (item: any) => {
  return {
    id: item.Id || item.Url,
    title: item.Name,
  };
};

const normalizeSong = (item: any) => {
  return {
    id: item.Id,
    parent: item.ParentId,
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
    size: item.MediaSources && item.MediaSources[0]?.Size,
    contentType: undefined,
    suffix: item.MediaSources && item.MediaSources[0]?.Container,
    duration: item.RunTimeTicks / 10000000,
    bitRate: item.MediaSources && String(Math.trunc(item.MediaSources[0]?.Bitrate / 1000)),
    path: item.Path,
    playCount: item.UserData && item.UserData.PlayCount,
    discNumber: undefined,
    created: item.DateCreated,
    streamUrl: getStreamUrl(item.Id),
    image: getCoverArtUrl(item, 150),
    starred: item.UserData && item.UserData.IsFavorite ? 'true' : undefined,
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
    starred: item.UserData && item.UserData.IsFavorite ? 'true' : undefined,
    type: Item.Album,
    uniqueId: nanoid(),
    song: (item.song || []).map((entry: any) => normalizeSong(entry)),
  };
};

const normalizeArtist = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    albumCount: item.AlbumCount,
    duration: item.RunTimeTicks / 10000000,
    image: getCoverArtUrl(item, 350),
    starred: item.UserData && item.UserData?.IsFavorite ? 'true' : undefined,
    info: {
      biography: item.Overview,
      externalUrl: (item.ExternalUrls || []).map((entry: any) => normalizeItem(entry)),
      imageUrl: undefined,
      similarArtist: (item.similarArtist || []).map((entry: any) => normalizeArtist(entry)),
    },
    type: Item.Artist,
    uniqueId: nanoid(),
    album: (item.album || []).map((entry: any) => normalizeAlbum(entry)),
  };
};

const normalizePlaylist = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    comment: item.Overview,
    owner: undefined,
    public: undefined,
    songCount: item.ChildCount,
    duration: item.RunTimeTicks / 10000000,
    created: item.DateCreated,
    changed: item.DateLastMediaAdded,
    genre: item.GenreItems && item.GenreItems.map((entry: any) => normalizeItem(entry)),
    image: getCoverArtUrl(item, 350),
    type: Item.Playlist,
    uniqueId: nanoid(),
    song: [],
  };
};

const normalizeGenre = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    songCount: undefined,
    albumCount: undefined,
    type: Item.Genre,
    uniqueId: nanoid(),
  };
};

const normalizeFolder = (item: any) => {
  return {
    id: item.Id,
    title: item.Name,
    created: item.DateCreated,
    isDir: true,
    image: getCoverArtUrl(item, 350),
    type: Item.Folder,
    uniqueId: nanoid(),
  };
};

const normalizeScanStatus = () => {
  return {
    scanning: false,
    count: 'N/a',
  };
};

export const getPlaylist = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items/${options.id}`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, ChildCount, ParentId',
      ids: options.id,
      userId: auth.username,
    },
  });

  const { data: songData } = await jellyfinApi.get(`/Playlists/${options.id}/Items`, {
    params: {
      userId: auth.username,
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
    },
  });

  return {
    ...normalizePlaylist(data),
    songCount: songData.Items.length,
    song: (songData.Items || []).map((entry: any) => normalizeSong(entry)),
  };
};

export const getPlaylists = async () => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, ParentId', // Removed ChildCount until new Jellyfin releases includes optimization
      includeItemTypes: 'Playlist',
      recursive: true,
      sortBy: 'SortName',
      sortOrder: 'Ascending',
    },
  });

  return (_.filter(data.Items, (item) => item.MediaType === 'Audio') || []).map((entry) =>
    normalizePlaylist(entry)
  );
};

export const createPlaylist = async (options: { name: string }) => {
  const { data } = await jellyfinApi.post(`/playlists`, {
    Name: options.name,
    UserId: auth.username,
    MediaType: 'Audio',
  });

  return data;
};

export const updatePlaylistSongs = async (options: { name: string; entry: Song[] }) => {
  const entryIds = _.map(options.entry, 'id');

  const { data } = await jellyfinApi.post(`/playlists`, {
    Name: options.name,
    Ids: entryIds,
    UserId: auth.username,
    MediaType: 'Audio',
  });

  return { id: data.Id };
};

export const updatePlaylistSongsLg = async (options: { id: string; entry: Song[] }) => {
  const entryIds = _.map(options.entry, 'id');
  const entryIdChunks = _.chunk(entryIds, 300);

  const res: any[] = [];
  for (let i = 0; i < entryIdChunks.length; i += 1) {
    const ids = entryIdChunks[i].join(',');
    const { data } = await jellyfinApi.post(`/playlists/${options.id}/items`, null, {
      params: { Ids: ids },
    });
    res.push(data);
  }

  return res;
};

export const deletePlaylist = async (options: { id: string }) => {
  return jellyfinApi.delete(`/items/${options.id}`);
};

export const updatePlaylist = async (options: {
  id: string;
  name?: string;
  comment?: string;
  dateCreated?: string;
  genres: GenericItem[];
}) => {
  const genres = _.map(options.genres, 'title');

  return jellyfinApi.post(`/items/${options.id}`, {
    Name: options.name,
    Overview: options.comment,
    DateCreated: options.dateCreated,
    Genres: genres || [], // Required
    Tags: [], // Required
    PremiereDate: null, // Required
    ProviderIds: {}, // Required
  });
};

export const getAlbum = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items/${options.id}`, {
    params: { fields: 'Genres, DateCreated, ChildCount' },
  });

  const { data: songData } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, ParentId',
      parentId: options.id,
      sortBy: 'SortName',
    },
  });

  return normalizeAlbum({ ...data, song: songData.Items });
};

export const getAlbums = async (options: {
  type: any;
  size: number;
  offset: number;
  recursive: boolean;
  musicFolderId?: string;
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
        fields: 'Genres, DateCreated, ChildCount, ParentId',
        genres: !sortType ? options.type : undefined,
        includeItemTypes: 'MusicAlbum',
        parentId: options.musicFolderId,
        recursive: true,
        sortBy: sortType ? sortType!.replacement : 'SortName',
        sortOrder: sortType ? sortType!.sortOrder : 'Ascending',
      },
    });

    return (data.Items || []).map((entry: any) => normalizeAlbum(entry));
  }

  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, ChildCount, ParentId',
      includeItemTypes: 'MusicAlbum',
      limit: options.size,
      offset: options.offset,
      parentId: options.musicFolderId,
      recursive: true,
      sortBy: sortType!.replacement,
      sortOrder: sortType!.sortOrder,
    },
  });

  return (data.Items || []).map((entry: any) => normalizeAlbum(entry));
};

export const getArtist = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items/${options.id}`);
  const { data: albumData } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      artistIds: options.id,
      includeItemTypes: 'MusicAlbum',
      fields: 'AudioInfo, ParentId, Genres, DateCreated, ChildCount, ParentId',
      recursive: true,
      sortBy: 'SortName',
    },
  });

  return normalizeArtist({
    ...data,
    album: albumData.Items,
  });
};

export const getArtists = async (options: { musicFolderId?: string }) => {
  const { data } = await jellyfinApi.get(`/artists/albumartists`, {
    params: {
      imageTypeLimit: 1,
      fields: 'Genres, ParentId',
      recursive: true,
      sortBy: 'SortName',
      sortOrder: 'Ascending',
      parentId: options.musicFolderId,
    },
  });

  return (data.Items || []).map((entry: any) => normalizeArtist(entry));
};

export const getArtistSongs = async (options: { id: string; musicFolderId?: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      artistIds: options.id,
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
      includeItemTypes: 'Audio',
      recursive: true,
      sortBy: 'Album',
      parentId: options.musicFolderId,
    },
  });

  return (data.Items || []).map((entry: any) => normalizeSong(entry));
};

export const getRandomSongs = async (options: {
  size?: number;
  genre?: string;
  fromYear?: number;
  toYear?: number;
}) => {
  let { fromYear, toYear } = options;

  if (!options.fromYear && options.toYear) {
    fromYear = 1930;
  }

  if (options.fromYear && !options.toYear) {
    toYear = moment().year() + 1;
  }

  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
      genres: options.genre,
      includeItemTypes: 'Audio',
      limit: options.size,
      recursive: true,
      sortBy: 'Random',
      years: (fromYear || toYear) && _.range(fromYear!, toYear! + 1).join(','),
    },
  });

  return (data.Items || []).map((entry: any) => normalizeSong(entry));
};

export const getStarred = async (options: { musicFolderId?: string }) => {
  const { data: songAndAlbumData } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, ChildCount, UserData, ParentId',
      includeItemTypes: 'MusicAlbum, Audio',
      isFavorite: true,
      recursive: true,
      parentId: options.musicFolderId,
    },
  });

  const { data: artistData } = await jellyfinApi.get(`/artists`, {
    params: {
      fields: 'Genres, ParentId',
      imageTypeLimit: 1,
      recursive: true,
      sortBy: 'SortName',
      sortOrder: 'Ascending',
      isFavorite: true,
      userId: auth.username,
      parentId: options.musicFolderId,
    },
  });

  return {
    album: (
      songAndAlbumData.Items.filter((data: any) => data.Type === 'MusicAlbum') || []
    ).map((entry: any) => normalizeAlbum(entry)),
    song: (
      songAndAlbumData.Items.filter((data: any) => data.Type === 'Audio') || []
    ).map((entry: any) => normalizeSong(entry)),
    artist: (artistData.Items || []).map((entry: any) => normalizeArtist(entry)),
  };
};

export const star = async (options: { id: string }) => {
  const { data } = await jellyfinApi.post(`/users/${auth.username}/favoriteitems/${options.id}`);
  return data;
};

export const unstar = async (options: { id: string }) => {
  const { data } = await jellyfinApi.delete(`/users/${auth.username}/favoriteitems/${options.id}`);
  return data;
};

export const batchStar = async (options: { ids: string[] }) => {
  const promises = [];
  for (let i = 0; i < options.ids.length; i += 1) {
    promises.push(star({ id: options.ids[i] }));
  }

  const res = await Promise.all(promises);

  return res;
};

export const batchUnstar = async (options: { ids: string[] }) => {
  const promises = [];
  for (let i = 0; i < options.ids.length; i += 1) {
    promises.push(unstar({ id: options.ids[i] }));
  }

  const res = await Promise.all(promises);

  return res;
};

export const getGenres = async (options: { musicFolderId?: string }) => {
  const { data } = await jellyfinApi.get(`/musicgenres`, {
    params: { parentId: options.musicFolderId },
  });
  return (data.Items || []).map((entry: any) => normalizeGenre(entry));
};

export const getIndexes = async () => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`);
  return (data.Items || []).map((entry: any) => normalizeFolder(entry));
};

export const getMusicDirectory = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      parentId: options.id,
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
      sortBy: 'SortName',
      sortOrder: 'Ascending',
    },
  });

  const { data: parentData } = await jellyfinApi.get(`/users/${auth.username}/items/${options.id}`);

  const folders = data.Items.filter((entry: any) => entry.Type !== 'Audio');
  const songs = data.Items.filter((entry: any) => entry.Type === 'Audio');

  return {
    id: parentData?.Id,
    title: parentData?.Name || 'Unknown folder',
    parent: parentData?.ParentId,
    child: _.concat(
      (folders || []).map((entry: any) => normalizeFolder(entry)),
      (songs || []).map((entry: any) => normalizeSong(entry))
    ),
  };
};

export const getMusicDirectorySongs = async (options: { id: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      excludeItemTypes: 'MusicAlbum, MusicArtist, Folder',
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
      recursive: true,
      sortBy: 'Album',
      parentId: options.id,
    },
  });

  return (data.Items || []).map((entry: any) => normalizeSong(entry));
};

export const getMusicFolders = async () => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`);
  return (data.Items || []).map((entry: any) => normalizeFolder(entry));
};

export const getSearch = async (options: { query: string; musicFolderId?: string | number }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, ChildCount, UserData, ParentId',
      includeArtists: false,
      includeGenres: false,
      includeItemTypes: 'Audio, MusicArtist, MusicAlbum',
      includeMedia: false,
      includeStudios: false,
      limit: 50,
      parentId: options.musicFolderId,
      recursive: true,
      searchTerm: options.query,
    },
  });

  const { data: artistData } = await jellyfinApi.get(`/artists`, {
    params: { limit: 10, parentId: options.musicFolderId, searchTerm: options.query },
  });

  const albumItems = data.Items.filter((entry: any) => entry.Type === 'MusicAlbum');
  const songItems = data.Items.filter((entry: any) => entry.Type === 'Audio');

  return {
    artist: (artistData.Items || []).map((entry: any) => normalizeArtist(entry)),
    album: (albumItems || []).map((entry: any) => normalizeAlbum(entry)),
    song: (songItems || []).map((entry: any) => normalizeSong(entry)),
  };
};

export const scrobble = async (options: {
  id: string;
  albumId?: string;
  submission: boolean;
  position?: number;
  event?: 'pause' | 'unpause';
}) => {
  if (options.submission) {
    jellyfinApi.post(`/sessions/playing/stopped`, {
      ItemId: options.id,
      IsPaused: true,
    });

    return jellyfinApi.post(`/users/${auth.username}/playeditems/${options.id}`, null, {
      params: {
        datePlayed: moment().format(),
      },
    });
  }

  if (options.event) {
    return jellyfinApi.post(`/sessions/playing/progress`, {
      ItemId: options.id,
      EventName: options.event,
      IsPaused: options.event === 'pause',
      PositionTicks: options.position && Math.round(options.position),
    });
  }

  return jellyfinApi.post(`/sessions/playing`, {
    ItemId: options.id,
    PositionTicks: options.position && Math.round(options.position),
  });
};

export const startScan = async (options: { musicFolderId?: string }) => {
  if (options.musicFolderId) {
    return jellyfinApi.post(`/items/${options.musicFolderId}/refresh`, {
      Recursive: true,
      ImageRefreshMode: 'Default',
      ReplaceAllImages: false,
      ReplaceAllMetadata: false,
    });
  }

  return jellyfinApi.post(`/library/refresh`);
};

export const getScanStatus = async () => {
  return normalizeScanStatus();
};
