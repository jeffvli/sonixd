import Axios from 'axios';

import useStore from 'store/useStore';

const { logout } = useStore.getState();

const axios = Axios.create({
  withCredentials: true,
});

axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    if (err.response && err.response.status === 401) {
      logout();
    }
    return Promise.reject(err);
  }
);

export default axios;
