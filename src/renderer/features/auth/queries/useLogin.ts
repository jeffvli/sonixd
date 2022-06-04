import { useMutation } from 'react-query';
import { authApi } from 'renderer/api';

export const useLogin = (
  server: string,
  body: {
    password: string;
    username: string;
  }
) => {
  return useMutation({
    mutationFn: () => authApi.login(server, body),
    onSuccess: () => {
      localStorage.setItem(
        'authentication',
        JSON.stringify({ isAuthenticated: true, serverUrl: server })
      );
    },
  });
};
