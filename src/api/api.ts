/* eslint-disable no-await-in-loop */
import axios from 'axios';
import _ from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import axiosRetry from 'axios-retry';
import { mockSettings } from '../shared/mockSettings';
import { Item } from '../types';
import { settings } from '../components/shared/setDefaultSettings';

const legacyAuth =
  process.env.NODE_ENV === 'test' ? mockSettings.legacyAuth : Boolean(settings.get('legacyAuth'));

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

const authParams = legacyAuth
  ? {
      u: auth.username,
      p: auth.password,
      v: '1.13.0',
      c: 'sonixd',
      f: 'json',
    }
  : {
      u: auth.username,
      s: auth.salt,
      t: auth.hash,
      v: '1.13.0',
      c: 'sonixd',
      f: 'json',
    };

export const api = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: (status) => status >= 200,
});

api.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.u = auth.username;
  config.params.s = legacyAuth ? null : auth.salt;
  config.params.t = legacyAuth ? null : auth.hash;
  config.params.p = legacyAuth ? auth.password : null;
  config.params.v = '1.13.0';
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

const getCoverArtUrl = (item: any, useLegacyAuth: boolean, size?: number) => {
  if (!item.coverArt && !item.artistImageUrl) {
    return 'img/placeholder.png';
  }

  if (!item.coverArt && !item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')) {
    return item.artistImageUrl;
  }

  if (item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')) {
    return 'img/placeholder.png';
  }

  if (useLegacyAuth) {
    return (
      `${API_BASE_URL}/getCoverArt.view` +
      `?id=${item.coverArt}` +
      `&u=${auth.username}` +
      `&p=${auth.password}` +
      `&v=1.13.0` +
      `&c=sonixd` +
      `${size ? `&size=${size}` : ''}`
    );
  }

  return (
    `${API_BASE_URL}/getCoverArt.view` +
    `?id=${item.coverArt}` +
    `&u=${auth.username}` +
    `&s=${auth.salt}` +
    `&t=${auth.hash}` +
    `&v=1.13.0` +
    `&c=sonixd` +
    `${size ? `&size=${size}` : ''}`
  );
};

export const getDownloadUrl = (options: { id: string }, useLegacyAuth = legacyAuth) => {
  if (useLegacyAuth) {
    return (
      `${API_BASE_URL}/download.view` +
      `?id=${options.id}` +
      `&u=${auth.username}` +
      `&p=${auth.password}` +
      `&v=1.13.0` +
      `&c=sonixd`
    );
  }

  return (
    `${API_BASE_URL}/download.view` +
    `?id=${options.id}` +
    `&u=${auth.username}` +
    `&s=${auth.salt}` +
    `&t=${auth.hash}` +
    `&v=1.13.0` +
    `&c=sonixd`
  );
};

const getStreamUrl = (id: string, useLegacyAuth: boolean) => {
  if (useLegacyAuth) {
    return (
      `${API_BASE_URL}/stream.view` +
      `?id=${id}` +
      `&u=${auth.username}` +
      `&p=${auth.password}` +
      `&v=1.13.0` +
      `&c=sonixd`
    );
  }

  return (
    `${API_BASE_URL}/stream.view` +
    `?id=${id}` +
    `&u=${auth.username}` +
    `&s=${auth.salt}` +
    `&t=${auth.hash}` +
    `&v=1.13.0` +
    `&c=sonixd`
  );
};

const normalizeAPIResult = (items: any, totalRecordCount?: number) => {
  return {
    data: items,
    totalRecordCount,
  };
};

const normalizeItem = (item: any) => {
  return {
    id: item.id || item.url,
    title: item.name,
  };
};

const normalizeSong = (item: any) => {
  return {
    id: item.id,
    parent: item.parent,
    isDir: item.isDir,
    title: item.title,
    album: item.album,
    albumId: item.albumId,
    albumArtist: item.artist,
    albumArtistId: item.artistId,
    artist: item.artist ? [{ id: item.artistId, title: item.artist }] : [],
    track: item.track,
    year: item.year,
    genre: item.genre ? [{ id: item.genre, title: item.genre }] : [],
    albumGenre: item.genre,
    size: item.size,
    contentType: item.contentType,
    suffix: item.suffix,
    duration: item.duration,
    bitRate: item.bitRate,
    path: item.path,
    playCount: item.playCount,
    discNumber: item.discNumber,
    created: item.created,
    streamUrl: getStreamUrl(item.id, legacyAuth),
    image: getCoverArtUrl(item, legacyAuth, 150),
    starred: item.starred,
    userRating: item.userRating,
    type: Item.Music,
    uniqueId: nanoid(),
  };
};

const normalizeAlbum = (item: any) => {
  return {
    id: item.id,
    title: item.name,
    albumId: item.id,
    albumArtist: item.artist,
    albumArtistId: item.artistId,
    artist: item.artist ? [{ id: item.artistId, title: item.artist }] : [],
    songCount: item.songCount,
    duration: item.duration,
    created: item.created,
    year: item.year,
    playCount: item.playCount,
    genre: item.genre ? [{ id: item.genre, title: item.genre }] : [],
    albumGenre: item.genre,
    image: getCoverArtUrl(item, legacyAuth, 350),
    isDir: false,
    starred: item.starred,
    userRating: item.userRating,
    type: Item.Album,
    uniqueId: nanoid(),
    song: (item.song || []).map((entry: any) => normalizeSong(entry)),
  };
};

const normalizeArtist = (item: any) => {
  return {
    id: item.id,
    title: item.name,
    albumCount: item.albumCount,
    image: getCoverArtUrl(item, legacyAuth, 350),
    starred: item.starred,
    userRating: item.userRating,
    info: {
      biography: item.biography,
      externalUrl: (item.externalUrls || []).map((entry: any) => normalizeItem(entry)),
      imageUrl:
        !item.externalImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f') && item.externalImageUrl,
      similarArtist: (item.similarArtist || []).map((entry: any) => normalizeArtist(entry)),
    },
    type: Item.Artist,
    uniqueId: nanoid(),
    album: (item.album || []).map((entry: any) => normalizeAlbum(entry)),
  };
};

const normalizePlaylist = (item: any) => {
  return {
    id: item.id,
    title: item.name,
    comment: item.comment,
    owner: item.owner,
    public: item.public,
    songCount: item.songCount,
    duration: item.duration,
    created: item.created,
    changed: item.changed,
    image: item.songCount > 0 ? getCoverArtUrl(item, legacyAuth, 350) : 'img/placeholder.png',
    type: Item.Playlist,
    uniqueId: nanoid(),
    song: (item.entry || []).map((entry: any) => normalizeSong(entry)),
  };
};

const normalizeGenre = (item: any) => {
  return {
    id: item.id,
    title: item.value,
    songCount: item.songCount,
    albumCount: item.albumCount,
    type: Item.Genre,
    uniqueId: nanoid(),
  };
};

const normalizeFolder = (item: any) => {
  return {
    id: item.id,
    title: item.name || item.title,
    created: item.DateCreated,
    isDir: true,
    image: getCoverArtUrl(item, legacyAuth, 350),
    type: Item.Folder,
    uniqueId: nanoid(),
  };
};

const normalizeScanStatus = (item: any) => {
  return {
    scanning: item.scanning,
    count: item.count,
  };
};

export const getPlaylist = async (options: { id: string }) => {
  const { data } = await api.get(`/getPlaylist.view`, { params: options });
  return normalizePlaylist(data.playlist);
};

export const getPlaylists = async () => {
  const { data } = await api.get('/getPlaylists.view');
  return (data.playlists?.playlist || []).map((playlist: any) => normalizePlaylist(playlist));
};

export const getStarred = async (options: { musicFolderId?: string | number }) => {
  const { data } = await api.get(`/getStarred2.view`, { params: options });

  return {
    album: (data.starred2.album || []).map((entry: any) => normalizeAlbum(entry)),
    song: (data.starred2.song || []).map((entry: any) => normalizeSong(entry)),
    artist: (data.starred2.artist || []).map((entry: any) => normalizeArtist(entry)),
  };
};

export const getAlbum = async (options: { id: string }) => {
  const { data } = await api.get(`/getAlbum.view`, { params: options });
  return normalizeAlbum(data.album);
};

export const getAlbums = async (
  options: {
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
    size: number;
    offset: number;
    fromYear?: number;
    toYear?: number;
    genre?: string;
    musicFolderId?: string | number;
    recursive?: boolean;
  },
  recursiveData: any[] = []
) => {
  if (options.recursive) {
    const albums: any = api
      .get(`/getAlbumList2.view`, {
        params: {
          type: options.type.match('alphabeticalByName|alphabeticalByArtist|frequent|newest|recent')
            ? options.type
            : 'byGenre',
          size: 500,
          offset: options.offset,
          genre: options.type.match(
            'alphabeticalByName|alphabeticalByArtist|frequent|newest|recent'
          )
            ? undefined
            : options.type,
          musicFolderId: options.musicFolderId,
        },
      })
      .then((res) => {
        if (!res.data.albumList2.album || res.data.albumList2.album.length === 0) {
          // Flatten and return once there are no more albums left
          const flattenedAlbums = _.flatten(recursiveData);

          return normalizeAPIResult(
            (flattenedAlbums || []).map((entry: any) => normalizeAlbum(entry)),
            flattenedAlbums.length
          );
        }

        // On every iteration, push the existing combined album array and increase the offset
        recursiveData.push(res.data.albumList2.album);
        return getAlbums(
          {
            type: options.type,
            size: options.size,
            offset: options.offset + options.size,
            musicFolderId: options.musicFolderId,
            recursive: true,
          },
          recursiveData
        );
      })
      .catch((err) => console.log(err));

    return albums;
  }

  const { data } = await api.get(`/getAlbumList2.view`, { params: options });
  return normalizeAPIResult(
    (data.albumList2.album || []).map((entry: any) => normalizeAlbum(entry)),
    data.albumList2.album.length
  );
};

export const getRandomSongs = async (options: {
  size?: number;
  genre?: string;
  fromYear?: number;
  toYear?: number;
  musicFolderId?: number;
}) => {
  const { data } = await api.get(`/getRandomSongs.view`, { params: options });
  return (data.randomSongs.song || []).map((entry: any) => normalizeSong(entry));
};

export const getArtist = async (options: { id: string }) => {
  const { data } = await api.get(`/getArtist.view`, { params: options });
  const { data: infoData } = await api.get(`/getArtistInfo2`, {
    params: { id: options.id, count: 15 },
  });

  const externalUrls = [];
  if (infoData?.artistInfo2?.lastFmUrl) {
    externalUrls.push({ name: 'Last.fm', url: infoData?.artistInfo2?.lastFmUrl });
  }

  if (infoData?.artistInfo2?.musicBrainzId) {
    externalUrls.push({
      name: 'Musicbrainz',
      url: `https://musicbrainz.org/artist/${infoData.artistInfo2.musicBrainzId}`,
    });
  }

  return normalizeArtist({
    ...data.artist,
    biography: infoData?.artistInfo2?.biography,
    externalUrls,
    externalImageUrl: infoData?.artistInfo2?.largeImageUrl,
    similarArtist: infoData?.artistInfo2?.similarArtist,
  });
};

export const getArtists = async (options: { musicFolderId?: string | number }) => {
  const { data } = await api.get(`/getArtists.view`, { params: options });
  const artists = (data.artists?.index || []).flatMap((index: any) => index.artist);
  return (artists || []).map((entry: any) => normalizeArtist(entry));
};

export const getArtistSongs = async (options: { id: string }) => {
  const promises = [];
  const { data } = await api.get(`/getArtist.view`, { params: options });

  for (let i = 0; i < data.artist.album.length; i += 1) {
    promises.push(api.get(`/getAlbum.view`, { params: { id: data.artist.album[i].id } }));
  }

  const res = await Promise.all(promises);

  return _.flatten(res.map((entry: any) => entry.data.album.song) || []).map((entry: any) =>
    normalizeSong(entry)
  );
};

export const startScan = async () => {
  const { data } = await api.get(`/startScan.view`);
  return normalizeScanStatus(data.scanStatus);
};

export const getScanStatus = async () => {
  const { data } = await api.get(`/getScanStatus.view`);
  return normalizeScanStatus(data.scanStatus);
};

export const star = async (options: { id: string; type: string }) => {
  const { data } = await api.get(`/star.view`, {
    params: {
      id: options.type === 'music' ? options.id : undefined,
      albumId: options.type === 'album' ? options.id : undefined,
      artistId: options.type === 'artist' ? options.id : undefined,
    },
  });

  return data;
};

export const unstar = async (options: { id: string; type: string }) => {
  const { data } = await api.get(`/unstar.view`, {
    params: {
      id: options.type === 'music' ? options.id : undefined,
      albumId: options.type === 'album' ? options.id : undefined,
      artistId: options.type === 'artist' ? options.id : undefined,
    },
  });

  return data;
};

export const batchStar = async (options: { ids: string[]; type: string }) => {
  const idChunks = _.chunk(options.ids, 325);

  let idParam: string;
  switch (options.type) {
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

    res.push((await api.get(`/star.view`, { params })).data);
  }

  return res;
};

export const batchUnstar = async (options: { ids: string[]; type: string }) => {
  const idChunks = _.chunk(options.ids, 325);

  let idParam: string;
  switch (options.type) {
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

    res.push((await api.get(`/unstar.view`, { params })).data);
  }

  return res;
};

export const setRating = async (options: { ids: string[]; rating: number }) => {
  const promises = [];

  for (let i = 0; i < options.ids.length; i += 1) {
    promises.push(
      api.get(`/setRating.view`, { params: { id: options.ids[i], rating: options.rating } })
    );
  }

  const res = await Promise.all(promises);

  return res;
};

export const getSimilarSongs = async (options: { id: string; count: number }) => {
  const { data } = await api.get(`/getSimilarSongs2.view`, { params: options });
  return (_.uniqBy(data?.similarSongs2?.song, (e: any) => e.id) || []).map((entry: any) =>
    normalizeSong(entry)
  );
};

export const getTopSongs = async (options: { artist: string; count: number }) => {
  const { data } = await api.get(`/getTopSongs.view`, { params: options });
  return (_.uniqBy(data?.topSongs?.song, (e: any) => e.id) || []).map((entry: any) =>
    normalizeSong(entry)
  );
};

export const getSongsByGenre = async (
  options: {
    genre: string;
    size: number;
    offset: number;
    musicFolderId?: string | number;
    recursive?: boolean;
    totalSongs: number;
  },
  recursiveData: any[] = []
) => {
  if (options.recursive) {
    const songs: any = api
      .get(`/getSongsByGenre.view`, {
        params: {
          genre: options.genre,
          count: options.size,
          offset: options.offset,
          musicFolderId: options.musicFolderId,
        },
      })
      .then((res) => {
        if (
          !res.data.songsByGenre.song ||
          res.data.songsByGenre.song.length === 0 ||
          options.totalSongs <= 0
        ) {
          // Flatten and return once there are no more albums left
          const flattenedSongs = _.flatten(recursiveData);

          return normalizeAPIResult(
            (flattenedSongs || []).map((entry: any) => normalizeSong(entry)),
            flattenedSongs.length
          );
        }

        // On every iteration, push the existing songs and increase the offset
        recursiveData.push(res.data.songsByGenre.song);

        return getSongsByGenre(
          {
            genre: options.genre,
            size: options.size,
            offset: options.offset + options.size,
            musicFolderId: options.musicFolderId,
            recursive: true,
            totalSongs: options.totalSongs - options.size,
          },
          recursiveData
        );
      })
      .catch((err) => console.log(err));

    return songs;
  }

  const { data } = await api.get(`/getSongsByGenre.view`, { params: options });
  return (_.uniqBy(data?.songsByGenre?.song, (e: any) => e.id) || []).map((entry: any) =>
    normalizeSong(entry)
  );
};

export const updatePlaylistSongs = async (options: { id: string; entry: any[] }) => {
  const playlistParams = new URLSearchParams();
  const songIds = _.map(options.entry, 'id');

  playlistParams.append('playlistId', options.id);
  songIds.map((songId: string) => playlistParams.append('songId', songId));
  _.mapValues(authParams, (value: string, key: string) => {
    playlistParams.append(key, value);
  });

  const { data } = await api.get(`/createPlaylist.view`, {
    params: playlistParams,
  });

  return data;
};

export const updatePlaylistSongsLg = async (options: { id: string; entry: any[] }) => {
  const entryIds = _.map(options.entry, 'id');

  // Set these in chunks so the api doesn't break
  // Testing on the airsonic api broke around ~350 entries
  const entryIdChunks = _.chunk(entryIds, 300);

  const res: any[] = [];
  for (let i = 0; i < entryIdChunks.length; i += 1) {
    const params = new URLSearchParams();

    params.append('playlistId', options.id);
    _.mapValues(authParams, (value: string, key: string) => {
      params.append(key, value);
    });

    for (let x = 0; x < entryIdChunks[i].length; x += 1) {
      params.append('songIdToAdd', String(entryIdChunks[i][x]));
    }

    const { data } = await api.get(`/updatePlaylist.view`, {
      params,
    });

    res.push(data);
  }

  return res;
};

export const deletePlaylist = async (options: { id: string }) => {
  const { data } = await api.get(`/deletePlaylist.view`, { params: { id: options.id } });
  return data;
};

export const createPlaylist = async (options: { name: string }) => {
  const { data } = await api.get(`/createPlaylist.view`, { params: options });
  return data;
};

export const updatePlaylist = async (options: {
  id: string;
  name: string;
  comment: string;
  isPublic: boolean;
}) => {
  const { data } = await api.get(`/updatePlaylist.view`, {
    params: {
      playlistId: options.id,
      name: options.name,
      comment: options.comment,
      public: options.isPublic,
    },
  });

  return data;
};

export const clearPlaylist = async (options: { id: string }) => {
  // Specifying the playlistId without any songs will empty the existing playlist
  const { data } = await api.get(`/createPlaylist.view`, {
    params: { playlistId: options.id, songId: '' },
  });

  return data;
};

export const getGenres = async () => {
  const { data } = await api.get(`/getGenres.view`);
  return (data.genres.genre || []).map((entry: any) => normalizeGenre(entry));
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
  const { data } = await api.get(`/search3.view`, { params: options });

  return {
    artist: {
      data: (data.searchResult3?.artist || []).map((entry: any) => normalizeArtist(entry)),
      nextCursor:
        data.searchResult3?.artist &&
        data.searchResult3.artist.length === options.artistCount &&
        (options!.artistOffset || 0) + (options!.artistCount || 0),
    },
    album: {
      data: (data.searchResult3?.album || []).map((entry: any) => normalizeAlbum(entry)),
      nextCursor:
        data.searchResult3?.album &&
        data.searchResult3.album.length === options.albumCount &&
        (options!.albumOffset || 0) + (options!.albumCount || 0),
    },
    song: {
      data: (data.searchResult3?.song || []).map((entry: any) => normalizeSong(entry)),
      nextCursor:
        data.searchResult3?.song &&
        data.searchResult3.song.length === options.songCount &&
        (options!.songOffset || 0) + (options!.songCount || 0),
    },
  };
};

export const scrobble = async (options: { id: string; time?: number; submission?: boolean }) => {
  const { data } = await api.get(`/scrobble.view`, { params: options });
  return data;
};

export const getIndexes = async (options: {
  musicFolderId?: string | number;
  ifModifiedSince?: any;
}) => {
  const { data } = await api.get(`/getIndexes.view`, { params: options });

  const folders: any[] = [];
  data.indexes.index.forEach((entry: any) => {
    entry.artist.forEach((folder: any) => {
      folders.push(normalizeFolder(folder));
    });
  });

  const child = (data.indexes?.child || []).map((entry: any) => normalizeSong(entry));
  return _.concat(_.flatten(folders), child);
};

export const getMusicFolders = async () => {
  const { data } = await api.get(`/getMusicFolders.view`);
  return (data?.musicFolders?.musicFolder || []).map((entry: any) => normalizeFolder(entry));
};

export const getMusicDirectory = async (options: { id: string }) => {
  const { data } = await api.get(`/getMusicDirectory.view`, { params: options });

  const child: any[] = [];
  const folders = data.directory?.child?.filter((entry: any) => entry.isDir);
  const songs = data.directory?.child?.filter((entry: any) => entry.isDir === false);

  (folders || []).forEach((folder: any) => child.push(normalizeFolder(folder)));
  (songs || []).forEach((entry: any) => child.push(normalizeSong(entry)));

  return {
    ...data.directory,
    title: data.directory?.name,
    child,
  };
};

export const getMusicDirectorySongs = async (options: { id: string }, data: any[] = []) => {
  if (options.id === 'stop') {
    const songs: any[] = [];

    (data || []).forEach((song: any) => {
      (song?.child || []).forEach((entry: any) => {
        if (entry.isDir === false) {
          songs.push(entry);
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
        return getMusicDirectorySongs({ id: 'stop' }, data);
      }

      data.push(res);
      const nestedFolders = res.child.filter((entry: any) => entry.isDir === true);

      for (let i = 0; i < nestedFolders.length; i += 1) {
        await getMusicDirectorySongs({ id: nestedFolders[i].id }, data);
      }

      return getMusicDirectorySongs({ id: 'stop' }, data);
    })
    .catch((err) => console.log(err));

  return folders;
};

export const getLyrics = async (options: { artist: string; title: string }) => {
  const { data } = await api.get(`/getLyrics.view`, { params: options });
  return data?.lyrics?.value;
};
