import md5 from 'md5';
import { nanoid } from 'nanoid';
import { useMutation } from 'react-query';
import { authApi } from 'renderer/api';
import { useAuthStore } from 'renderer/store';

export const useLogin = (
  serverUrl: string,
  body: {
    password: string;
    username: string;
  }
) => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: () => authApi.login(serverUrl, body),
    onSuccess: () => {
      const key = md5(serverUrl);
      login({ key, serverUrl });

      if (!localStorage.getItem('device_id')) {
        localStorage.setItem('device_id', nanoid());
      }

      localStorage.setItem(
        'authentication',
        JSON.stringify({
          isAuthenticated: true,
          key,
          serverUrl,
        })
      );
    },
  });
};
