import { axios } from 'renderer/lib';
import { ServerResponse } from './types';

const getServers = async () => {
  const { data } = await axios.get<ServerResponse[]>('/servers');
  return data;
};

const createServer = async (body: {
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
  createServer,
  getServers,
};
