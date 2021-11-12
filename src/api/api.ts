/* eslint-disable no-await-in-loop */
import axios from 'axios';
import _ from 'lodash';
import settings from 'electron-settings';
import { nanoid } from 'nanoid/non-secure';
import axiosRetry from 'axios-retry';
import { mockSettings } from '../shared/mockSettings';

const legacyAuth =
  process.env.NODE_ENV === 'test'
    ? mockSettings.legacyAuth
    : Boolean(settings.getSync('legacyAuth'));

const getAuth = (useLegacyAuth: boolean) => {
  if (useLegacyAuth) {
    return {
      username: localStorage.getItem('username') || '',
      password: localStorage.getItem('password') || '',
      server: localStorage.getItem('server') || '',
    };
  }

  return {
    username: localStorage.getItem('username') || '',
    salt: localStorage.getItem('salt') || '',
    hash: localStorage.getItem('hash') || '',
    server: localStorage.getItem('server') || '',
  };
};

const auth = getAuth(legacyAuth);
const API_BASE_URL = `${auth.server}/rest`;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.u = auth.username;
  config.params.s = legacyAuth ? null : auth.salt;
  config.params.t = legacyAuth ? null : auth.hash;
  config.params.p = legacyAuth ? auth.password : null;
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

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

export const autoFailApi = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: () => {
    return false;
  },
});

autoFailApi.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.u = auth.username;
  config.params.s = auth.salt;
  config.params.t = auth.hash;
  config.params.v = '1.15.0';
  config.params.c = 'sonixd';
  config.params.f = 'json';
  return config;
});

autoFailApi.interceptors.response.use(
  (res) => {
    // Return the subsonic response directly
    res.data = res.data['subsonic-response'];
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);

axiosRetry(autoFailApi, {
  retries: 5,
  retryCondition: (e: any) => {
    return e.response.data['subsonic-response'].status !== 'ok';
  },
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

const authParams = {
  u: auth.username,
  s: auth.salt,
  t: auth.hash,
  v: '1.15.0',
  c: 'sonixd',
  f: 'json',
};

const getCoverArtUrl = (item: any, useLegacyAuth: boolean, size?: number) => {
  if (!item.coverArt && !item.artistImageUrl) {
    return 'img/placeholder.jpg';
  }

  if (!item.coverArt && !item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')) {
    return item.artistImageUrl;
  }

  if (item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')) {
    return 'img/placeholder.jpg';
  }

  if (useLegacyAuth) {
    if (!size) {
      return (
        `${API_BASE_URL}/getCoverArt` +
        `?id=${item.coverArt}` +
        `&u=${auth.username}` +
        `&s=${auth.salt}` +
        `&t=${auth.hash}` +
        `&v=1.15.0` +
        `&c=sonixd`
      );
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
  }

  if (!size) {
    return (
      `${API_BASE_URL}/getCoverArt` +
      `?id=${item.coverArt}` +
      `&u=${auth.username}` +
      `&s=${auth.salt}` +
      `&t=${auth.hash}` +
      `&v=1.15.0` +
      `&c=sonixd`
    );
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

const getStreamUrl = (id: string, useLegacyAuth: boolean) => {
  if (useLegacyAuth) {
    return (
      `${API_BASE_URL}/stream` +
      `?id=${id}` +
      `&u=${auth.username}` +
      `&p=${auth.password}` +
      `&v=1.15.0` +
      `&c=sonixd`
    );
  }

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

export const getPlaylists = async (sortBy: string) => {
  const { data } = await api.get('/getPlaylists');

  const newData =
    sortBy === 'dateCreated'
      ? data.playlists?.playlist.sort((a: any, b: any) => {
          return a.created > b.created ? -1 : a.created < b.created ? 1 : 0;
        })
      : sortBy === 'dateModified'
      ? data.playlists?.playlist.sort((a: any, b: any) => {
          return a.changed > b.changed ? -1 : a.changed < b.changed ? 1 : 0;
        })
      : sortBy === 'name'
      ? _.orderBy(data.playlists.playlist || [], [(entry) => entry.name.toLowerCase()], 'asc')
      : data.playlists?.playlist;

  return (newData || []).map((playlist: any) => ({
    ...playlist,
    name: playlist.name,
    image:
      playlist.songCount > 0 ? getCoverArtUrl(playlist, legacyAuth, 350) : 'img/placeholder.jpg',
    type: 'playlist',
    uniqueId: nanoid(),
  }));
};

export const getPlaylist = async (id: string) => {
  const { data } = await api.get(`/getPlaylist?id=${id}`);
  return {
    ...data.playlist,
    entry: null, // Normalize to 'song' instead of 'entry'
    song: (data.playlist.entry || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id, legacyAuth),
      image: getCoverArtUrl(entry, legacyAuth, 150),
      type: 'music',
      index,
      uniqueId: nanoid(),
    })),
    image:
      data.playlist.songCount > 0
        ? getCoverArtUrl(data.playlist, legacyAuth, 350)
        : 'img/placeholder.jpg',
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
      streamUrl: getStreamUrl(entry.id, legacyAuth),
      index,
    })),
  };
};

export const getStarred = async (options: { musicFolderId?: string | number }) => {
  const { data } = await api.get(`/getStarred2`, { params: options });

  return {
    ...data.starred2,
    album: (data.starred2.album || []).map((entry: any, index: any) => ({
      ...entry,
      title: entry.name,
      albumId: entry.id,
      image: getCoverArtUrl(entry, legacyAuth, 350),
      starred: entry.starred || undefined,
      type: 'album',
      isDir: false,
      index,
      uniqueId: nanoid(),
    })),
    song: (data.starred2.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id, legacyAuth),
      image: getCoverArtUrl(entry, legacyAuth, 150),
      starred: entry.starred || undefined,
      type: 'music',
      index,
      uniqueId: nanoid(),
    })),
    artist: (data.starred2.artist || []).map((entry: any, index: any) => ({
      ...entry,
      albumCount: entry.albumCount || undefined,
      coverArt: getCoverArtUrl(entry, legacyAuth),
      image: getCoverArtUrl(entry, legacyAuth, 350),
      starred: entry.starred || Date.now(), // Airsonic does not return the starred date
      type: 'artist',
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getAlbums = async (options: {
  type:
    | 'random'
    | 'newest'
    | 'highest'
    | 'frequent'
    | 'recent'
    | 'alphabeticalByName'
    | 'alphabeticalByArtist'
    | 'starred'
    | 'byYear'
    | 'byGenre';
  size?: number;
  offset?: number;
  fromYear?: number;
  toYear?: number;
  genre?: string;
  musicFolderId?: string | number;
}) => {
  const { data } = await api.get(`/getAlbumList2`, {
    params: options,
  });

  return {
    ...data.albumList2,
    album: (data.albumList2.album || []).map((entry: any, index: any) => ({
      ...entry,
      title: entry.name,
      albumId: entry.id,
      image: getCoverArtUrl(entry, legacyAuth, 350),
      starred: entry.starred || undefined,
      type: 'album',
      isDir: false,
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getAlbumsDirect = async (options: {
  type:
    | 'random'
    | 'newest'
    | 'highest'
    | 'frequent'
    | 'recent'
    | 'alphabeticalByName'
    | 'alphabeticalByArtist'
    | 'starred'
    | 'byYear'
    | 'byGenre';
  size?: number;
  offset?: number;
  fromYear?: number;
  toYear?: number;
  genre?: string;
  musicFolderId?: string | number;
}) => {
  const { data } = await api.get(`/getAlbumList2`, {
    params: options,
  });

  const albums = (data.albumList2.album || []).map((entry: any, index: any) => ({
    ...entry,
    title: entry.name,
    albumId: entry.id,
    image: getCoverArtUrl(entry, legacyAuth, 350),
    starred: entry.starred || undefined,
    type: 'album',
    isDir: false,
    index,
    uniqueId: nanoid(),
  }));

  return albums;
};

export const getAllAlbums = (
  options: {
    type:
      | string // Handle generic genres
      | 'random'
      | 'newest'
      | 'highest'
      | 'frequent'
      | 'recent'
      | 'alphabeticalByName'
      | 'alphabeticalByArtist'
      | 'starred'
      | 'byYear'
      | 'byGenre';
    size: number;
    offset: number;
    fromYear?: number;
    toYear?: number;
    genre?: string;
    musicFolderId?: string | number;
  },
  data: any[] = []
) => {
  const albums: any = api
    .get(`/getAlbumList2`, {
      params: {
        type: options.type.match('alphabeticalByName|alphabeticalByArtist|frequent|newest|recent')
          ? options.type
          : 'byGenre',
        size: 500,
        offset: options.offset,
        genre: options.type.match('alphabeticalByName|alphabeticalByArtist|frequent|newest|recent')
          ? undefined
          : options.type,
        musicFolderId: options.musicFolderId,
      },
    })
    .then((res) => {
      if (!res.data.albumList2.album || res.data.albumList2.album.length === 0) {
        // Flatten the array and return once there are no more albums left
        const flattened = _.flatten(data);
        return flattened.map((entry: any, index: any) => ({
          ...entry,
          title: entry.name,
          albumId: entry.id,
          image: getCoverArtUrl(entry, legacyAuth, 350),
          starred: entry.starred || undefined,
          type: 'album',
          isDir: false,
          index,
          uniqueId: nanoid(),
        }));
      }

      // On every iteration, push the existing combined album array and increase the offset
      data.push(res.data.albumList2.album);
      return getAllAlbums(
        {
          type: options.type,
          size: options.size,
          offset: options.offset + options.size,
          musicFolderId: options.musicFolderId,
        },
        data
      );
    })
    .catch((err) => console.log(err));

  return albums;
};

export const getAlbum = async (id: string) => {
  const { data } = await api.get(`/getAlbum`, {
    params: {
      id,
    },
  });

  return {
    ...data.album,
    image: getCoverArtUrl(data.album, legacyAuth, 350),
    type: 'album',
    isDir: false,
    song: (data.album.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id, legacyAuth),
      image: getCoverArtUrl(entry, legacyAuth, 150),
      type: 'music',
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getRandomSongs = async (options: {
  size?: number;
  genre?: string;
  fromYear?: number;
  toYear?: number;
  musicFolderId?: number;
}) => {
  const { data } = await api.get(`/getRandomSongs`, {
    params: options,
  });

  return {
    ...data.randomSongs,
    song: (data.randomSongs.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id, legacyAuth),
      image: getCoverArtUrl(entry, legacyAuth, 150),
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getArtists = async (options: { musicFolderId?: string | number }) => {
  const { data } = await api.get(`/getArtists`, {
    params: options,
  });

  const artistList: any[] = [];
  const artists = (data.artists?.index || []).flatMap((index: any) => index.artist);

  artists.map((artist: any) =>
    artistList.push({
      ...artist,
      image: getCoverArtUrl(artist, legacyAuth, 350),
      type: 'artist',
      uniqueId: nanoid(),
    })
  );

  return artistList;
};

export const getArtist = async (id: string) => {
  const { data } = await api.get(`/getArtist`, {
    params: {
      id,
    },
  });

  return {
    ...data.artist,
    image: getCoverArtUrl(data.artist, legacyAuth, 350),
    type: 'artist',
    album: (data.artist.album || []).map((entry: any, index: any) => ({
      ...entry,
      albumId: entry.id,
      type: 'album',
      isDir: false,
      image: getCoverArtUrl(entry, legacyAuth, 350),
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getArtistInfo = async (id: string, count = 10) => {
  const { data } = await api.get(`/getArtistInfo2`, {
    params: {
      id,
      count,
    },
  });

  return {
    ...data.artistInfo2,
  };
};

export const getAllArtistSongs = async (id: string) => {
  const promises = [];
  const artist = await getArtist(id);

  for (let i = 0; i < artist.album.length; i += 1) {
    promises.push(getAlbum(artist.album[i].id));
  }

  const res = await Promise.all(promises);
  return _.flatten(_.map(res, 'song'));
};

export const startScan = async () => {
  const { data } = await api.get(`/startScan`);
  const scanStatus = data?.scanStatus;

  return scanStatus;
};

export const getScanStatus = async () => {
  const { data } = await api.get(`/getScanStatus`);
  const scanStatus = data?.scanStatus;

  return scanStatus;
};

export const star = async (id: string, type: string) => {
  const { data } = await api.get(`/star`, {
    params: {
      id: type === 'music' ? id : undefined,
      albumId: type === 'album' ? id : undefined,
      artistId: type === 'artist' ? id : undefined,
    },
  });

  return data;
};

export const unstar = async (id: string, type: string) => {
  const { data } = await api.get(`/unstar`, {
    params: {
      id: type === 'music' ? id : undefined,
      albumId: type === 'album' ? id : undefined,
      artistId: type === 'artist' ? id : undefined,
    },
  });

  return data;
};

export const batchStar = async (ids: string[], type: string) => {
  const idChunks = _.chunk(ids, 325);

  let idParam: string;
  switch (type) {
    case 'music':
      idParam = 'id';
      break;
    case 'album':
      idParam = 'albumId';
      break;
    case 'artist':
      idParam = 'artistId';
      break;
    default:
      break;
  }

  const res: any[] = [];
  for (let i = 0; i < idChunks.length; i += 1) {
    const params = new URLSearchParams();

    idChunks[i].forEach((id: string) => params.append(idParam, id));
    _.mapValues(authParams, (value: string, key: string) => {
      params.append(key, value);
    });

    res.push(
      (
        await api.get(`/star`, {
          params,
        })
      ).data
    );
  }

  return res;
};

export const batchUnstar = async (ids: string[], type: string) => {
  const idChunks = _.chunk(ids, 325);

  let idParam: string;
  switch (type) {
    case 'music':
      idParam = 'id';
      break;
    case 'album':
      idParam = 'albumId';
      break;
    case 'artist':
      idParam = 'artistId';
      break;
    default:
      break;
  }

  const res: any[] = [];
  for (let i = 0; i < idChunks.length; i += 1) {
    const params = new URLSearchParams();

    idChunks[i].forEach((id: string) => params.append(idParam, id));
    _.mapValues(authParams, (value: string, key: string) => {
      params.append(key, value);
    });

    res.push(
      (
        await api.get(`/unstar`, {
          params,
        })
      ).data
    );
  }

  return res;
};

export const setRating = async (id: string, rating: number) => {
  const { data } = await api.get(`/setRating`, {
    params: {
      id,
      rating,
    },
  });

  return data;
};

export const getSimilarSongs = async (id: string, count: number) => {
  const { data } = await api.get(`/getSimilarSongs2`, {
    params: { id, count },
  });

  return {
    song: (data.similarSongs2.song || []).map((entry: any, index: any) => ({
      ...entry,
      image: getCoverArtUrl(entry, legacyAuth, 150),
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const updatePlaylistSongs = async (id: string, entry: any[]) => {
  const playlistParams = new URLSearchParams();
  const songIds = _.map(entry, 'id');

  playlistParams.append('playlistId', id);
  songIds.map((songId: string) => playlistParams.append('songId', songId));
  _.mapValues(authParams, (value: string, key: string) => {
    playlistParams.append(key, value);
  });

  const { data } = await api.get(`/createPlaylist`, {
    params: playlistParams,
  });

  return data;
};

export const updatePlaylistSongsLg = async (playlistId: string, entry: any[]) => {
  const entryIds = _.map(entry, 'id');

  // Set these in chunks so the api doesn't break
  // Testing on the airsonic api broke around ~350 entries
  const entryIdChunks = _.chunk(entryIds, 300);

  const res: any[] = [];
  for (let i = 0; i < entryIdChunks.length; i += 1) {
    const params = new URLSearchParams();

    params.append('playlistId', playlistId);
    _.mapValues(authParams, (value: string, key: string) => {
      params.append(key, value);
    });

    for (let x = 0; x < entryIdChunks[i].length; x += 1) {
      params.append('songIdToAdd', String(entryIdChunks[i][x]));
    }

    const { data } = await api.get(`/updatePlaylist`, {
      params,
    });

    res.push(data);
  }

  return res;
};

export const deletePlaylist = async (id: string) => {
  const { data } = await api.get(`/deletePlaylist`, {
    params: {
      id,
    },
  });

  return data;
};

export const createPlaylist = async (name: string) => {
  const { data } = await api.get(`/createPlaylist`, {
    params: {
      name,
    },
  });

  return data;
};

export const updatePlaylist = async (
  playlistId: string,
  name: string,
  comment: string,
  isPublic: boolean
) => {
  const { data } = await api.get(`/updatePlaylist`, {
    params: {
      playlistId,
      name,
      comment,
      public: isPublic,
    },
  });

  return data;
};

export const clearPlaylist = async (playlistId: string) => {
  // Specifying the playlistId without any songs will empty the existing playlist
  const { data } = await api.get(`/createPlaylist`, {
    params: {
      playlistId,
      songId: '',
    },
  });

  return data;
};

export const getGenres = async () => {
  const { data } = await api.get(`/getGenres`);

  return (data.genres.genre || []).map((entry: any, index: any) => ({
    id: entry.value, // List view uses id to match the playing song so we need an arbitrary id here
    ...entry,
    name: entry.value,
    index,
    uniqueId: nanoid(),
  }));
};

export const search3 = async (options: {
  query: string;
  artistCount?: number;
  artistOffset?: 0;
  albumCount?: number;
  albumOffset?: 0;
  songCount?: number;
  songOffset?: 0;
  musicFolderId?: string | number;
}) => {
  const { data } = await api.get(`/search3`, { params: options });

  const results = data.searchResult3;

  return {
    artist: (results.artist || []).map((entry: any, index: any) => ({
      ...entry,
      image: getCoverArtUrl(entry, legacyAuth, 350),
      starred: entry.starred || undefined,
      type: 'artist',
      index,
      uniqueId: nanoid(),
    })),
    album: (results.album || []).map((entry: any, index: any) => ({
      ...entry,
      albumId: entry.id,
      image: getCoverArtUrl(entry, legacyAuth, 350),
      starred: entry.starred || undefined,
      type: 'album',
      isDir: false,
      index,
      uniqueId: nanoid(),
    })),
    song: (results.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id, legacyAuth),
      image: getCoverArtUrl(entry, legacyAuth, 150),
      type: 'music',
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const scrobble = async (options: { id: string; time?: number; submission?: boolean }) => {
  const { data } = await api.get(`/scrobble`, {
    params: options,
  });

  return data;
};

export const getIndexes = async (options: {
  musicFolderId?: string | number;
  ifModifiedSince?: any;
}) => {
  const { data } = await api.get(`/getIndexes`, {
    params: options,
  });

  let folders: any[] = [];
  data.indexes.index.forEach((entry: any) => {
    entry.artist.forEach((folder: any) => {
      folders.push({
        ...folder,
        title: folder.name,
        isDir: true,
        image: getCoverArtUrl(folder, legacyAuth, 150),
        uniqueId: nanoid(),
        type: 'folder',
      });
    });
  });

  folders = _.flatten(folders);

  const child: any[] = [];
  (data.indexes?.child || []).forEach((song: any, index: any) =>
    child.push({
      ...song,
      index,
      type: 'music',
      streamUrl: getStreamUrl(song.id, legacyAuth),
      image: getCoverArtUrl(song, legacyAuth, 150),
      uniqueId: nanoid(),
    })
  );

  return _.concat(folders, child);
};

export const getMusicFolders = async () => {
  const { data } = await api.get(`/getMusicFolders`);

  return data?.musicFolders?.musicFolder;
};

export const getMusicDirectory = async (options: { id: string }) => {
  const { data } = await api.get(`/getMusicDirectory`, {
    params: options,
  });

  const child: any[] = [];
  const folders = data.directory?.child?.filter((entry: any) => entry.isDir);
  const songs = data.directory?.child?.filter((entry: any) => entry.isDir === false);

  (folders || []).forEach((folder: any) =>
    child.push({
      ...folder,
      image: getCoverArtUrl(folder, legacyAuth, 150),
      uniqueId: nanoid(),
      type: 'folder',
    })
  );

  (songs || []).forEach((song: any, index: any) =>
    child.push({
      ...song,
      index,
      type: 'music',
      streamUrl: getStreamUrl(song.id, legacyAuth),
      image: getCoverArtUrl(song, legacyAuth, 150),
      uniqueId: nanoid(),
    })
  );

  return {
    ...data.directory,
    child,
  };
};

export const getAllDirectorySongs = async (options: { id: string }, data: any[] = []) => {
  if (options.id === 'stop') {
    const songs: any[] = [];

    (data || []).forEach((song: any, index: any) => {
      (song?.child || []).forEach((entry: any) => {
        if (entry.isDir === false) {
          songs.push({
            ...entry,
            index,
            type: 'music',
            streamUrl: getStreamUrl(entry.id, legacyAuth),
            image: getCoverArtUrl(entry, legacyAuth, 150),
            uniqueId: nanoid(),
          });
        }
      });
    });

    return songs;
  }
  const folders: any = getMusicDirectory({ id: options.id })
    .then(async (res) => {
      // If there are no more entries with isDir === true (folder), then return
      if (res.child.filter((entry: any) => entry.isDir === true).length === 0) {
        // Add the last directory if there are no other directories
        data.push(res);
        return getAllDirectorySongs({ id: 'stop' }, data);
      }

      data.push(res);
      const nestedFolders = res.child.filter((entry: any) => entry.isDir === true);

      for (let i = 0; i < nestedFolders.length; i += 1) {
        await getAllDirectorySongs({ id: nestedFolders[i].id }, data);
      }

      return getAllDirectorySongs({ id: 'stop' }, data);
    })
    .catch((err) => console.log(err));

  return folders;
};
