import { axios } from 'renderer/lib';

const getServers = async () => {
  const { data } = await axios.get<any[]>('/servers');
  return data;
};

const createServer = async (body: {
  name: string;
  remoteUserId: string;
  token: string;
  url: string;
  username: string;
}) => {
  const { data } = await axios.post<any>('/servers', body);
  return data;
};

export const serversApi = {
  createServer,
  getServers,
};
