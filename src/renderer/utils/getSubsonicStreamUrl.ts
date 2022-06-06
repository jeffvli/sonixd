import { SongResponse } from 'renderer/api/types';
// import { ServerFolderAuth } from 'renderer/features/servers';

export const getSubsonicStreamUrl = (
  auth: any,
  song: SongResponse,
  deviceId: string
) => {
  return (
    `${auth.url}/stream.view` +
    `?id=${song.remoteId}` +
    `&${auth.token}` +
    `&v=1.13.0` +
    `&c=sonixd_${deviceId}`
  );
};
