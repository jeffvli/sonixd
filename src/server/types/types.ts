export type Server = {
  id: number;
  name: string;
  url: string;
  alternateUrl: string;
  username: string;
  token: string;
  serverType: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: number;
  username: string;
  password: string;
  enabled: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Genre = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Artist = {
  id: number;
  name: string;
  imageUrl?: string;
  biography: string;
  favorite?: boolean;
  rating?: number;
  remoteId: string;
  remoteCreatedAt: string;
  createdAt: string;
  updatedAt: string;

  genres?: Genre[];
};

export type Album = {
  id: number;
  name: string;
  imageUrl?: string;
  biography?: string;
  favorite?: boolean;
  rating?: number;
  remoteId: string;
  remoteCreatedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Song = {
  id: number;
  name: string;
  imageUrl?: string;
  favorite?: boolean;
  rating?: number;
  remoteId: string;
  remoteCreatedAt: string;
  createdAt: string;
  updatedAt: string;
};
