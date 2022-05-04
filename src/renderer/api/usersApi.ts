import axios from 'renderer/lib/axios';
import useStore from 'store/useStore';

const { serverUrl } = useStore.getState();

const get = async () => {
  const { data } = await axios.get('/users', { baseURL: serverUrl });

  return data;
};

export const usersApi = {
  get,
};
