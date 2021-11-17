export enum Server {
  Subsonic = 'subsonic',
  Jellyfin = 'jellyfin',
}

export type ServerType = Server.Subsonic | Server.Jellyfin;

export type APIEndpoints = 'getPlaylist' | 'getPlaylists';
