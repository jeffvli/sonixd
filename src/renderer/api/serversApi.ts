import axios from 'renderer/lib/axios';
import { ServerResponse, ServersResponse } from './types';

const getServers = async () => {
  const { data } = await axios.get<ServersResponse>('/servers');
  return data;
};

const create = async (body: {
  name: string;
  remoteUserId: string;
  token: string;
  url: string;
  username: string;
}) => {
  const { data } = await axios.post<ServerResponse>('/servers', body);
  return data;
};

export const serversApi = {
  create,
  getServers,
};
