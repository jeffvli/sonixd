export enum Server {
  Subsonic = 'subsonic',
  Jellyfin = 'jellyfin',
}

export enum Item {
  Album = 'album',
  Artist = 'artist',
  Folder = 'folder',
  Genre = 'genre',
  Music = 'music',
  Playlist = 'playlist',
}

export type ServerType = Server.Subsonic | Server.Jellyfin;

export type APIEndpoints =
  | 'getPlaylist'
  | 'getPlaylists'
  | 'getStarred'
  | 'getAlbum'
  | 'getAlbums'
  | 'getRandomSongs'
  | 'getArtist'
  | 'getArtists'
  | 'getArtistInfo'
  | 'getArtistSongs'
  | 'startScan'
  | 'getScanStatus'
  | 'star'
  | 'unstar'
  | 'batchStar'
  | 'batchUnstar'
  | 'setRating'
  | 'getSimilarSongs'
  | 'updatePlaylistSongs'
  | 'updatePlaylistSongsLg'
  | 'deletePlaylist'
  | 'createPlaylist'
  | 'updatePlaylist'
  | 'updatePlaylistSongsLg'
  | 'deletePlaylist'
  | 'createPlaylist'
  | 'updatePlaylist'
  | 'clearPlaylist'
  | 'getGenres'
  | 'getSearch'
  | 'scrobble'
  | 'getIndexes'
  | 'getMusicFolders'
  | 'getMusicDirectory'
  | 'getMusicDirectorySongs'
  | 'getDownloadUrl';

export interface Album {
  id: string;
  title: string;
  isDir?: boolean;
  albumId: string;
  albumArtist?: string;
  albumArtistId: string;
  artist?: Artist[];
  songCount: number;
  duration: number;
  created: string;
  year?: number;
  genre?: Genre[];
  albumGenre?: string;
  image: string;
  starred?: string;
  type: Item.Album;
  uniqueId: string;
  song?: Song[];
}

export interface Artist {
  id: string;
  title: string;
  albumCount?: number;
  image?: string;
  starred?: string;
  type?: Item.Artist;
  uniqueId?: string;
  album?: Album[];
}

export interface ArtistInfo {
  biography?: string;
  lastFmUrl?: string;
  imageUrl?: string;
  similarArtist?: Artist[];
}
export interface Folder {
  id: string;
  title: string;
  isDir?: boolean;
  image: string;
  type: Item.Folder;
  uniqueId: string;
}

export interface Genre {
  id: string;
  title: string;
  songCount?: number;
  albumCount?: number;
  type?: Item.Genre;
  uniqueId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  comment?: string;
  owner?: string;
  public?: boolean;
  songCount?: number;
  duration: number;
  created?: string;
  changed?: string;
  image: string;
  type: Item.Playlist;
  uniqueId: string;
  song?: Song[];
}

export interface Song {
  id: string;
  parent?: string;
  title: string;
  isDir?: boolean;
  album: string;
  albumId?: string;
  albumArtist: string;
  albumArtistId: string;
  artist: Artist[];
  track?: number;
  year?: number;
  genre?: Genre[];
  albumGenre?: string;
  size: number;
  contentType?: string;
  suffix?: string;
  duration?: number;
  bitRate?: number;
  path?: string;
  playCount?: number;
  discNumber?: number;
  created: string;
  streamUrl: string;
  image: string;
  starred?: string;
  type: Item.Music;
  uniqueId: string;
}
