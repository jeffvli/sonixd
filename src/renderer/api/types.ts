export type BaseResponse = {
  data: any;
  error?: any;
  response: 'Success' | 'Error';
  statusCode: number;
};

export type ServerResponse = {
  createdAt: string;
  id: number;
  name: string;
  remoteUserId: string;
  serverFolder?: ServerFolderResponse[];
  serverType: string;
  token: string;
  updatedAt: string;
  url: string;
  username: string;
};

export type ServerFolderResponse = {
  createdAt: string;
  enabled: boolean;
  id: number;
  isPublic: boolean;
  name: string;
  remoteId: string;
  serverId: number;
  updatedAt: string;
};

export type UserResponse = {
  createdAt: string;
  enabled: boolean;
  id: number;
  isAdmin: boolean;
  password: string;
  updatedAt: string;
  username: string;
};

export type PingResponse = {
  description: string;
  name: string;
  version: string;
};

export type GenreResponse = {
  createdAt: string;
  id: number;
  name: string;
  updatedAt: string;
};

export type AlbumResponse = {
  albumArtistId: number;
  createdAt: string;
  date: string;
  genres: GenreResponse[];
  id: number;
  name: string;
  remoteCreatedAt: string;
  remoteId: string;
  serverFolderId: number;
  songs: SongResponse[];
  updatedAt: string;
  year: number;
};

export type SongResponse = {
  albumId: number;
  artistName: null;
  bitRate: number;
  container: string;
  createdAt: string;
  date: string;
  disc: number;
  duration: number;
  id: number;
  name: string;
  remoteCreatedAt: string;
  remoteId: string;
  serverFolderId: number;
  track: number;
  updatedAt: string;
  year: number;
};
