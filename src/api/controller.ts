import { notifyToast } from '../components/shared/toast';
import {
  batchStar,
  batchUnstar,
  clearPlaylist,
  createPlaylist,
  deletePlaylist,
  getAlbum,
  getAlbums,
  getArtist,
  getArtistInfo,
  getArtists,
  getArtistSongs,
  getDownloadUrl,
  getGenres,
  getIndexes,
  getMusicDirectory,
  getMusicDirectorySongs,
  getMusicFolders,
  getPlaylist,
  getPlaylists,
  getRandomSongs,
  getScanStatus,
  getSearch,
  getSimilarSongs,
  getStarred,
  scrobble,
  setRating,
  star,
  startScan,
  unstar,
  updatePlaylist,
  updatePlaylistSongs,
  updatePlaylistSongsLg,
} from './api';
import { getPlaylist as jfGetPlaylist, getPlaylists as jfGetPlaylists } from './jellyfinApi';
import { APIEndpoints, ServerType } from '../types';

// prettier-ignore
const endpoints = [
  { id: 'getPlaylist', endpoint: { subsonic: getPlaylist, jellyfin: jfGetPlaylist } },
  { id: 'getPlaylists', endpoint: { subsonic: getPlaylists, jellyfin: jfGetPlaylists } },
  { id: 'getStarred', endpoint: { subsonic: getStarred, jellyfin: undefined } },
  { id: 'getAlbum', endpoint: { subsonic: getAlbum, jellyfin: undefined } },
  { id: 'getAlbums', endpoint: { subsonic: getAlbums, jellyfin: undefined } },
  { id: 'getRandomSongs', endpoint: { subsonic: getRandomSongs, jellyfin: undefined } },
  { id: 'getArtist', endpoint: { subsonic: getArtist, jellyfin: undefined } },
  { id: 'getArtists', endpoint: { subsonic: getArtists, jellyfin: undefined } },
  { id: 'getArtistInfo', endpoint: { subsonic: getArtistInfo, jellyfin: undefined } },
  { id: 'getArtistSongs', endpoint: { subsonic: getArtistSongs, jellyfin: undefined } },
  { id: 'startScan', endpoint: { subsonic: startScan, jellyfin: undefined } },
  { id: 'getScanStatus', endpoint: { subsonic: getScanStatus, jellyfin: undefined } },
  { id: 'star', endpoint: { subsonic: star, jellyfin: undefined } },
  { id: 'unstar', endpoint: { subsonic: unstar, jellyfin: undefined } },
  { id: 'batchStar', endpoint: { subsonic: batchStar, jellyfin: undefined } },
  { id: 'batchUnstar', endpoint: { subsonic: batchUnstar, jellyfin: undefined } },
  { id: 'setRating', endpoint: { subsonic: setRating, jellyfin: undefined } },
  { id: 'getSimilarSongs', endpoint: { subsonic: getSimilarSongs, jellyfin: undefined } },
  { id: 'updatePlaylistSongs', endpoint: { subsonic: updatePlaylistSongs, jellyfin: undefined } },
  { id: 'updatePlaylistSongsLg', endpoint: { subsonic: updatePlaylistSongsLg, jellyfin: undefined } },
  { id: 'deletePlaylist', endpoint: { subsonic: deletePlaylist, jellyfin: undefined } },
  { id: 'createPlaylist', endpoint: { subsonic: createPlaylist, jellyfin: undefined } },
  { id: 'updatePlaylist', endpoint: { subsonic: updatePlaylist, jellyfin: undefined } },
  { id: 'clearPlaylist', endpoint: { subsonic: clearPlaylist, jellyfin: undefined } },
  { id: 'getGenres', endpoint: { subsonic: getGenres, jellyfin: undefined } },
  { id: 'getSearch', endpoint: { subsonic: getSearch, jellyfin: undefined } },
  { id: 'scrobble', endpoint: { subsonic: scrobble, jellyfin: undefined } },
  { id: 'getIndexes', endpoint: { subsonic: getIndexes, jellyfin: undefined } },
  { id: 'getMusicFolders', endpoint: { subsonic: getMusicFolders, jellyfin: undefined } },
  { id: 'getMusicDirectory', endpoint: { subsonic: getMusicDirectory, jellyfin: undefined } },
  { id: 'getMusicDirectorySongs', endpoint: { subsonic: getMusicDirectorySongs, jellyfin: undefined } },
  { id: 'getDownloadUrl', endpoint: { subsonic: getDownloadUrl, jellyfin: undefined } },
];

export const apiController = async (options: {
  serverType: ServerType;
  endpoint: APIEndpoints;
  args?: any;
}) => {
  const selectedEndpoint = endpoints.find((e) => e.id === options.endpoint);
  const selectedEndpointFn = selectedEndpoint!.endpoint[options.serverType];

  if (!selectedEndpointFn || !selectedEndpoint) {
    return notifyToast('warning', `[${options.endpoint}] not available`);
  }

  const res = await selectedEndpointFn(options.args);
  return res;
};
