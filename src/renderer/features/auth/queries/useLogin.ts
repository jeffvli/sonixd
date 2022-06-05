import md5 from 'md5';
import { nanoid } from 'nanoid';
import { useMutation } from 'react-query';
import { authApi } from 'renderer/api';
import { useAppDispatch } from 'renderer/hooks';
import { login } from 'renderer/store/authSlice';

export const useLogin = (
  serverUrl: string,
  body: {
    password: string;
    username: string;
  }
) => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => authApi.login(serverUrl, body),
    onSuccess: () => {
      dispatch(login(serverUrl));

      if (!localStorage.getItem('device_id')) {
        localStorage.setItem('device_id', nanoid());
      }

      localStorage.setItem(
        'authentication',
        JSON.stringify({
          isAuthenticated: true,
          key: md5(serverUrl),
          serverUrl,
        })
      );
    },
  });
};
