export type BaseResponse = {
  data: any;
  error?: any;
  response: 'Success' | 'Error';
  statusCode: number;
};

export type ServerResponse = Server;

export type ServersResponse = Server[];

export type UserResponse = User;

export type UsersResponse = User[];

export type PingResponse = Ping;

export interface Server {
  createdAt: string;
  id: number;
  name: string;
  remoteUserId: string;
  serverFolder?: ServerFolder[];
  serverType: string;
  token: string;
  updatedAt: string;
  url: string;
  username: string;
}

export interface ServerFolder {
  createdAt: string;
  enabled: boolean;
  id: number;
  isPublic: boolean;
  name: string;
  remoteId: string;
  serverId: number;
  updatedAt: string;
}

export interface User {
  createdAt: string;
  enabled: boolean;
  id: number;
  isAdmin: boolean;
  password: string;
  updatedAt: string;
  username: string;
}

export interface Ping {
  description: string;
  name: string;
  version: string;
}
