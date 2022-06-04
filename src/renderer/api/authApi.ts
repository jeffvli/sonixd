import axios from 'renderer/lib/axios';
import getServerUrl from 'renderer/utils/getServerUrl';
import { PingResponse, UserResponse } from './types';

const login = async (
  server: string,
  body: {
    password: string;
    username: string;
  }
) => {
  const serverUrl = getServerUrl(server);
  const { data } = await axios.post<UserResponse>(
    `${serverUrl}/auth/login`,
    body,
    {
      withCredentials: true,
    }
  );

  return data;
};

const ping = async (server: string) => {
  const serverUrl = getServerUrl(server);
  const { data } = await axios.get<PingResponse>(`${serverUrl}/auth/ping`, {
    timeout: 2000,
  });

  return data;
};

export const authApi = {
  login,
  ping,
};
