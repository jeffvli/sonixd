import { useMutation } from 'react-query';

import { authApi } from 'renderer/api';

const useLogin = (options: {
  server: string;
  username: string;
  password: string;
}) => {
  const { server, username, password } = options;

  return useMutation(() => authApi.login({ server, username, password }));
};

export default useLogin;
