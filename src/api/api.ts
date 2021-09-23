/* eslint-disable no-await-in-loop */
import axios from 'axios';
import _ from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import axiosRetry from 'axios-retry';

const getAuth = () => {
  const serverConfig = {
    username: localStorage.getItem('username') || '',
    salt: localStorage.getItem('salt') || '',
    hash: localStorage.getItem('hash') || '',
    server: localStorage.getItem('server') || '',
  };

  return serverConfig;
};

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

const getCoverArtUrl = (item: any, size = 150) => {
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
    image: playlist.songCount > 0 ? getCoverArtUrl(playlist) : 'img/placeholder.jpg',
  }));
};

export const getPlaylist = async (id: string) => {
  const { data } = await api.get(`/getPlaylist?id=${id}`);
  return {
    ...data.playlist,
    entry: null, // Normalize to 'song' instead of 'entry'
    song: (data.playlist.entry || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      image: getCoverArtUrl(entry),
      index,
      uniqueId: nanoid(),
    })),
    image: data.playlist.songCount > 0 ? getCoverArtUrl(data.playlist) : 'img/placeholder.jpg',
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
      albumId: entry.id,
      image: getCoverArtUrl(entry),
      type: 'album',
      index,
      uniqueId: nanoid(),
    })),
    song: (data.starred2.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      image: getCoverArtUrl(entry),
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
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
      albumId: entry.id,
      image: getCoverArtUrl(entry, coverArtSize),
      starred: entry.starred || undefined,
      type: 'album',
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getAlbumsDirect = async (options: any, coverArtSize = 150) => {
  const { data } = await api.get(`/getAlbumList2`, {
    params: options,
  });

  const albums = (data.albumList2.album || []).map((entry: any, index: any) => ({
    ...entry,
    albumId: entry.id,
    image: getCoverArtUrl(entry, coverArtSize),
    starred: entry.starred || undefined,
    type: 'album',
    index,
    uniqueId: nanoid(),
  }));

  return albums;
};

// ! Rewrite as async function
export const getAllAlbums = (
  offset: number,
  sortType: string,
  data: any[] = [],
  coverArtSize = 150
) => {
  const albums: any = api
    .get(`/getAlbumList2`, {
      params: {
        type: sortType,
        size: 500,
        offset,
      },
    })
    .then((res) => {
      if (!res.data.albumList2.album) {
        // Flatten the array and return once there are no more albums left
        const flattened = _.flatten(data);
        return flattened.map((entry: any, index: any) => ({
          ...entry,
          albumId: entry.id,
          image: getCoverArtUrl(entry, coverArtSize),
          starred: entry.starred || undefined,
          type: 'album',
          index,
          uniqueId: nanoid(),
        }));
      }

      // On every iteration, push the existing combined album array and increase the offset
      data.push(res.data.albumList2.album);
      return getAllAlbums(offset + 500, sortType, data);
    })
    .catch((err) => console.log(err));

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
    image: getCoverArtUrl(data.album, coverArtSize),
    type: 'album',
    song: (data.album.song || []).map((entry: any, index: any) => ({
      ...entry,
      streamUrl: getStreamUrl(entry.id),
      image: getCoverArtUrl(entry, coverArtSize),
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
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
      starred: entry.starred || undefined,
      index,
      uniqueId: nanoid(),
    })),
  };
};

export const getArtists = async () => {
  const { data } = await api.get(`/getArtists`);

  const artistList: any[] = [];
  const artists = (data.artists?.index || []).flatMap((index: any) => index.artist);

  artists.map((artist: any) =>
    artistList.push({
      ...artist,
      image: getCoverArtUrl(artist, 150),
      type: 'artist',
    })
  );

  return artistList;
};

export const getArtist = async (id: string, coverArtSize = 150) => {
  const { data } = await api.get(`/getArtist`, {
    params: {
      id,
    },
  });

  return {
    ...data.artist,
    image: getCoverArtUrl(data.artist, coverArtSize),
    album: (data.artist.album || []).map((entry: any, index: any) => ({
      ...entry,
      albumId: entry.id,
      image: getCoverArtUrl(entry, coverArtSize),
      starred: entry.starred || undefined,
      index,
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

export const getSimilarSongs = async (id: string, count: number, coverArtSize = 150) => {
  const { data } = await api.get(`/getSimilarSongs2`, {
    params: { id, count },
  });

  return {
    song: (data.similarSongs2.song || []).map((entry: any, index: any) => ({
      ...entry,
      image: getCoverArtUrl(entry, coverArtSize),
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
  const entryIdChunks = _.chunk(entryIds, 325);

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
    },
  });

  return data;
};
