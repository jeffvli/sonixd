export type Server = {
  id: number;
  name: string;
  url: string;
  username: string;
  token: string;
  serverType: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  serverFolder?: ServerFolder[];
};

export type ServerFolder = {
  id: number;
  name: string;
  remoteId: string;
  enabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  serverId: number;
};

export type User = {
  id: number;
  username: string;
  password?: string;
  enabled: boolean;
  isAdmin: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type Genre = {
  id: number;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
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
  createdAt: Date | string;
  updatedAt: Date | string;

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
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type Song = {
  id: number;
  name: string;
  imageUrl?: string;
  favorite?: boolean;
  rating?: number;
  remoteId: string;
  remoteCreatedAt: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type OffsetPagination = {
  limit: number;
  page: number;
};

export type PaginationResponse = {
  totalEntries: number;
  startIndex: number;
  nextPage: string;
  prevPage: string;
};

export type SuccessResponse = {
  data: any;
  paginationItems?: PaginationItems;
};

export type PaginationItems = {
  totalEntries: number;
  startIndex: number;
  limit: number;
  url: string;
};
