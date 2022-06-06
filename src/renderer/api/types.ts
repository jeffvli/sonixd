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

export type ArtistResponse = {
  biography: string | null;
  createdAt: string;
  id: number;
  name: string;
  remoteCreatedAt: string | null;
  remoteId: string;
  serverFolderId: number;
  updatedAt: string;
};

export type ExternalResponse = {
  createdAt: string;
  id: number;
  name: string;
  updatedAt: string;
  url: string;
};

export type ImageResponse = {
  createdAt: string;
  id: number;
  name: string;
  updatedAt: string;
  url: string;
};

export type AlbumResponse = {
  _count: CountResponse;
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
  album?: AlbumResponse;
  albumId: number;
  artistName: null;
  artists?: ArtistResponse[];
  bitRate: number;
  container: string;
  createdAt: string;
  date: string;
  disc: number;
  duration: number;
  externals?: ExternalResponse[];
  id: number;
  images?: ImageResponse[];
  name: string;
  remoteCreatedAt: string;
  remoteId: string;
  serverFolderId: number;
  track: number;
  updatedAt: string;
  year: number;
};

export type CountResponse = {
  artists?: number;
  externals?: number;
  favorites?: number;
  genres?: number;
  images?: number;
  ratings?: number;
  songs?: number;
};
