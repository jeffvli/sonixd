import { notifyToast } from '../components/shared/toast';
import { getPlaylists } from './api';
import { getPlaylists as jfGetPlaylists } from './jellyfinApi';
import { APIEndpoints, ServerType } from './types';

const endpoints = [
  { id: 'getPlaylist', endpoint: { subsonic: undefined, jellyfin: undefined } },
  { id: 'getPlaylists', endpoint: { subsonic: getPlaylists, jellyfin: jfGetPlaylists } },
];

export const apiController = async (serverType: ServerType, endpoint: APIEndpoints) => {
  const selectedEndpoint = endpoints.find((e) => e.id === endpoint)?.endpoint[serverType];

  if (!selectedEndpoint) {
    return notifyToast('warning', `[${endpoint}] not available`);
  }

  return selectedEndpoint();
};
