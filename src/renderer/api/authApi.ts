import axios from 'axios';

import getServerUrl from 'renderer/utils/getServerUrl';

const login = async (options: {
  server: string;
  username: string;
  password: string;
}) => {
  const { server, username, password } = options;
  const url = getServerUrl(server);

  const { data } = await axios.post(
    `${url}/auth/login`,
    { username, password },
    { withCredentials: true }
  );

  return data;
};

const ping = async (options: { server: string }) => {
  const { server } = options;
  const url = getServerUrl(server);

  const { data } = await axios.get(`${url}/auth/ping`, {
    timeout: 2000,
  });

  return data;
};

export const authApi = {
  login,
  ping,
};
