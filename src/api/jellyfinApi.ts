/* eslint-disable no-await-in-loop */
import axios from 'axios';
import axiosRetry from 'axios-retry';
import settings from 'electron-settings';
import _ from 'lodash';
import moment from 'moment';
import { nanoid } from 'nanoid/non-secure';
import i18n from '../i18n/i18n';
import { handleDisconnect } from '../components/settings/DisconnectButton';
import { notifyToast } from '../components/shared/toast';
import { GenericItem, Item, Song } from '../types';
import { mockSettings } from '../shared/mockSettings';

const transcode =
  process.env.NODE_ENV === 'test' ? mockSettings.transcode : Boolean(settings.getSync('transcode'));

const getAuth = () => {
  return {
    username: localStorage.getItem('username') || '',
    token: localStorage.getItem('token') || '',
    server: localStorage.getItem('server') || '',
    deviceId: localStorage.getItem('deviceId') || '',
    transcode,
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
      notifyToast('warning', i18n.t('Session expired. Logging out.'));
      handleDisconnect();
    }

    return Promise.reject(err);
  }
);

axiosRetry(jellyfinApi, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

const getStreamUrl = (id: string, container: string, mediaSourceId: string, eTag: string) => {
  if (!auth.transcode) {
    return (
      `${API_BASE_URL}/audio` +
      `/${id}` +
      `/stream${container ? `.${container}` : ''}` +
      `?static=true` +
      `&deviceId=${auth.deviceId}` +
      `&mediaSourceId=${mediaSourceId}` +
      `&tag=${eTag}` +
      `&api_key=${auth.token}`
    );
  }

  return (
    `${API_BASE_URL}/audio` +
    `/${id}/universal` +
    `?userId=${auth.username}` +
    `&deviceId=${auth.deviceId}` +
    `&audioCodec=aac` +
    `&api_key=${auth.token}` +
    `&playSessionId=${auth.deviceId}` +
    `&container=opus,mp3,aac,m4a,m4b,flac,wav,ogg` +
    `&transcodingContainer=ts` +
    `&transcodingProtocol=hls`
  );
};

const getCoverArtUrl = (item: any, size?: number) => {
  if (!item.ImageTags?.Primary && !item.AlbumPrimaryImageTag) {
    return 'img/placeholder.png';
  }

  if (item.ImageTags.Primary) {
    return (
      // eslint-disable-next-line prefer-template
      `${API_BASE_URL}/Items` +
      `/${item.Id}` +
      `/Images/Primary` +
      (size ? `?width=${size}&height=${size}` : '?height=350') +
      `&quality=90`
    );
  }

  // Fall back to album art if no image embedded
  return (
    // eslint-disable-next-line prefer-template
    `${API_BASE_URL}/Items` +
    `/${item.AlbumId}` +
    `/Images/Primary` +
    (size ? `?width=${size}&height=${size}` : '?height=350') +
    `&quality=90`
  );
};

export const getDownloadUrl = (options: { id: string }) => {
  return `${API_BASE_URL}/items/${options.id}/download?api_key=${auth.token}`;
};

const normalizeAPIResult = (items: any, totalRecordCount?: number) => {
  return {
    data: items,
    totalRecordCount,
  };
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
    bitRate: item.MediaSources && Number(Math.trunc(item.MediaSources[0]?.Bitrate / 1000)),
    path: item.MediaSources && item.MediaSources[0]?.Path,
    playCount: item.UserData && item.UserData.PlayCount,
    discNumber: (item.ParentIndexNumber && item.ParentIndexNumber) || 1,
    created: item.DateCreated,
    streamUrl: getStreamUrl(
      item.MediaSources[0]?.Id,
      item.MediaSources[0]?.Container,
      item.MediaSources[0]?.Id,
      item.MediaSources[0]?.ETag
    ),
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
    albumGenre: item.GenreItems && item.GenreItems[0]?.Name,
    image: getCoverArtUrl(item),
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
    genre: item.GenreItems && item.GenreItems.map((entry: any) => normalizeItem(entry)),
    image: getCoverArtUrl(item),
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
    image: getCoverArtUrl(item, 150),
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
      fields: 'Genres, DateCreated, ParentId, Overview', // Removed ChildCount until new Jellyfin releases includes optimization
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
  const entryIdChunks = _.chunk(entryIds, 200);

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
    { original: 'alphabeticalByArtist', replacement: 'AlbumArtist', sortOrder: 'Ascending' },
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

    return normalizeAPIResult(
      (data.Items || []).map((entry: any) => normalizeAlbum(entry)),
      data.TotalRecordCount
    );
  }

  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, ChildCount, ParentId',
      genres: !sortType ? options.type : undefined,
      includeItemTypes: 'MusicAlbum',
      limit: options.size,
      startIndex: options.offset,
      parentId: options.musicFolderId,
      recursive: true,
      sortBy: sortType ? sortType!.replacement : 'SortName',
      sortOrder: sortType ? sortType!.sortOrder : 'Ascending',
    },
  });

  return normalizeAPIResult(
    (data.Items || []).map((entry: any) => normalizeAlbum(entry)),
    data.TotalRecordCount
  );
};

export const getSongs = async (options: {
  type: any;
  size: number;
  offset: number;
  recursive: boolean;
  order: 'asc' | 'desc';
  musicFolderId?: string;
}) => {
  const sortTypes = [
    { original: 'alphabeticalByName', replacement: 'Name' },
    { original: 'alphabeticalByAlbum', replacement: 'Album' },
    { original: 'alphabeticalByArtist', replacement: 'AlbumArtist' },
    { original: 'alphabeticalByTrackArtist', replacement: 'Artist' },
    { original: 'frequent', replacement: 'PlayCount' },
    { original: 'random', replacement: 'Random' },
    { original: 'newest', replacement: 'DateCreated' },
    { original: 'recent', replacement: 'DatePlayed' },
    { original: 'year', replacement: 'PremiereDate' },
    { original: 'duration', replacement: 'Runtime' },
  ];

  const sortType = sortTypes.find((type) => type.original === options.type);

  if (options.recursive) {
    const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
      params: {
        fields: 'Genres, DateCreated, MediaSources, ParentId',
        genres: !sortType ? options.type : undefined,
        includeItemTypes: 'Audio',
        parentId: options.musicFolderId,
        recursive: true,
        sortBy: sortType ? sortType!.replacement : 'SortName',
        sortOrder: options.order === 'asc' ? 'Ascending' : 'Descending',
        imageTypeLimit: 1,
        enableImageTypes: 'Primary',
      },
    });

    return normalizeAPIResult(
      (data.Items || []).map((entry: any) => normalizeSong(entry)),
      data.TotalRecordCount
    );
  }

  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, ParentId',
      includeItemTypes: 'Audio',
      limit: options.size,
      startIndex: options.offset,
      parentId: options.musicFolderId,
      recursive: true,
      sortBy: sortType!.replacement,
      sortOrder: options.order === 'asc' ? 'Ascending' : 'Descending',
      imageTypeLimit: 1,
      enableImageTypes: 'Primary',
    },
  });

  return normalizeAPIResult(
    (data.Items || []).map((entry: any) => normalizeSong(entry)),
    data.TotalRecordCount
  );
};

export const getArtist = async (options: { id: string; musicFolderId?: string }) => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items/${options.id}`, {
    params: { fields: 'Genres' },
  });
  const { data: albumData } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      artistIds: options.id,
      includeItemTypes: 'MusicAlbum',
      fields: 'AudioInfo, ParentId, Genres, DateCreated, ChildCount, ParentId',
      recursive: true,
      sortBy: 'SortName',
      parentId: options.musicFolderId,
    },
  });

  const { data: similarData } = await jellyfinApi.get(`/artists/${options.id}/similar`, {
    params: { limit: 15, userId: auth.username, parentId: options.musicFolderId },
  });

  return normalizeArtist({
    ...data,
    similarArtist: similarData.Items,
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
      userId: auth.username,
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

  const entries = (data.Items || []).map((entry: any) => normalizeSong(entry));

  // The entries returned by Jellyfin's API are out of their normal album order
  const entriesDescByYear = _.orderBy(
    entries || [],
    ['year', 'album', 'discNumber', 'track'],
    ['desc', 'asc', 'asc', 'asc']
  );

  return entriesDescByYear;
};

export const getRandomSongs = async (options: {
  size?: number;
  genre?: string;
  fromYear?: number;
  toYear?: number;
  musicFolderId?: string;
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
      parentId: options.musicFolderId,
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
    album: (songAndAlbumData.Items.filter((data: any) => data.Type === 'MusicAlbum') || []).map(
      (entry: any) => normalizeAlbum(entry)
    ),
    song: (songAndAlbumData.Items.filter((data: any) => data.Type === 'Audio') || []).map(
      (entry: any) => normalizeSong(entry)
    ),
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

export const getSimilarSongs = async (options: {
  id: string;
  count: number;
  musicFolderId?: string;
}) => {
  const { data } = await jellyfinApi.get(`/items/${options.id}/instantmix`, {
    params: {
      userId: auth.username,
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
      parentId: options.musicFolderId,
      limit: options.count || 100,
    },
  });

  return (data.Items || []).map((entry: any) => normalizeSong(entry));
};

export const getSongsByGenre = async (options: {
  genre: string;
  size: number;
  offset: number;
  musicFolderId?: string | number;
  recursive?: boolean;
}) => {
  if (options.recursive) {
    const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
      params: {
        fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
        genres: options.genre,
        recursive: true,
        includeItemTypes: 'Audio',
        StartIndex: 0,
      },
    });

    const entries = (data.Items || []).map((entry: any) => normalizeSong(entry));

    return normalizeAPIResult(
      _.orderBy(entries || [], ['album', 'track'], ['asc', 'asc']),
      data.TotalRecordCount
    );
  }

  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`, {
    params: {
      fields: 'Genres, DateCreated, MediaSources, UserData, ParentId',
      genres: options.genre,
      recursive: true,
      includeItemTypes: 'Audio',
      limit: options.size || 100,
      startIndex: options.offset,
    },
  });

  const entries = (data.Items || []).map((entry: any) => normalizeSong(entry));

  return normalizeAPIResult(
    _.orderBy(entries || [], ['album', 'track'], ['asc', 'asc']),
    data.TotalRecordCount
  );
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
      parentId: options.id,
    },
  });

  const entries = (data.Items || []).map((entry: any) => normalizeSong(entry));

  // The entries returned by Jellyfin's API are out of their normal album order
  const entriesByAlbum = _.orderBy(
    entries || [],
    ['album', 'discNumber', 'track'],
    ['asc', 'asc', 'asc']
  );

  return entriesByAlbum;
};

export const getMusicFolders = async () => {
  const { data } = await jellyfinApi.get(`/users/${auth.username}/items`);
  return (data.Items || []).map((entry: any) => normalizeFolder(entry));
};

export const getSearch = async (options: {
  query: string;
  artistCount?: 0;
  artistOffset?: 0;
  albumCount?: 0;
  albumOffset?: 0;
  songCount?: 0;
  songOffset?: 0;
  musicFolderId?: string | number;
}) => {
  const songs =
    options.songCount !== 0 &&
    (
      await jellyfinApi.get(`/users/${auth.username}/items`, {
        params: {
          fields: 'Genres, DateCreated, MediaSources, ParentId',
          includeItemTypes: 'Audio',
          includeArtists: false,
          includeGenres: false,
          includeMedia: false,
          includeStudios: false,
          limit: options.songCount,
          startIndex: options.songOffset,
          parentId: options.musicFolderId,
          recursive: true,
          searchTerm: options.query,
        },
      })
    )?.data;

  const albums =
    options.albumCount !== 0 &&
    (
      await jellyfinApi.get(`/users/${auth.username}/items`, {
        params: {
          fields: 'Genres, DateCreated, ChildCount, ParentId',
          includeItemTypes: 'MusicAlbum',
          includeArtists: false,
          includeGenres: false,
          includeMedia: false,
          includeStudios: false,
          limit: options.albumCount,
          startIndex: options.albumOffset,
          parentId: options.musicFolderId,
          recursive: true,
          searchTerm: options.query,
        },
      })
    )?.data;

  const artists =
    options.artistCount !== 0 &&
    (
      await jellyfinApi.get(`/artists`, {
        params: {
          fields: 'Genres, ParentId',
          limit: options.artistCount,
          startIndex: options.artistOffset,
          parentId: options.musicFolderId,
          searchTerm: options.query,
          imageTypeLimit: 1,
          recursive: true,
          userId: auth.username,
        },
      })
    )?.data;

  return {
    artist: {
      data: (artists.Items || []).map((entry: any) => normalizeArtist(entry)),
      nextCursor:
        (options!.artistCount || 0) + (options!.artistOffset || 0) < artists.TotalRecordCount &&
        (options!.artistCount || 0) + (options!.artistOffset || 0),
    },
    album: {
      data: (albums.Items || []).map((entry: any) => normalizeAlbum(entry)),
      nextCursor:
        (options!.albumCount || 0) + (options!.albumOffset || 0) < albums.TotalRecordCount &&
        (options!.albumCount || 0) + (options!.albumOffset || 0),
    },
    song: {
      data: (songs?.Items || []).map((entry: any) => normalizeSong(entry)),
      nextCursor:
        (options!.songCount || 0) + (options!.songOffset || 0) < songs?.TotalRecordCount &&
        (options!.songCount || 0) + (options!.songOffset || 0),
    },
  };
};

export const scrobble = async (options: {
  id: string;
  submission: boolean;
  position?: number;
  event?: 'pause' | 'unpause' | 'timeupdate' | 'start';
}) => {
  if (options.submission) {
    // Checked by jellyfin-plugin-lastfm for whether or not to send the "finished" scrobble (uses PositionTicks)
    jellyfinApi.post(`/sessions/playing/stopped`, {
      ItemId: options.id,
      IsPaused: true,
      PositionTicks: options.position && Math.round(options.position),
    });
  }

  if (options.event) {
    if (options.event === 'start') {
      return jellyfinApi.post(`/sessions/playing`, {
        ItemId: options.id,
        PositionTicks: options.position && Math.round(options.position),
      });
    }

    return jellyfinApi.post(`/sessions/playing/progress`, {
      ItemId: options.id,
      EventName: options.event,
      IsPaused: options.event === 'pause',
      PositionTicks: options.position && Math.round(options.position),
    });
  }

  return jellyfinApi.post(`/sessions/playing/progress`, {
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
