import { axios } from 'renderer/lib';
import { PingResponse, UserResponse } from './types';

const login = async (
  serverUrl: string,
  body: {
    password: string;
    username: string;
  }
) => {
  const { data } = await axios.post<UserResponse>(
    `${serverUrl}/api/auth/login`,
    body,
    {
      withCredentials: true,
    }
  );

  return data;
};

const ping = async (serverUrl: string) => {
  const { data } = await axios.get<PingResponse>(`${serverUrl}/api/auth/ping`, {
    timeout: 2000,
  });

  return data;
};

export const authApi = {
  login,
  ping,
};
