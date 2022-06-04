import Axios from 'axios';

export const axios = Axios.create({
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    const serverBaseURL = JSON.parse(
      localStorage.getItem('authentication') || '{}'
    )?.serverUrl;

    config.baseURL = `${serverBaseURL}/api`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axios.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    if (err.response && err.response.status === 401) {
      console.log('unauthorized');
    }
    return Promise.reject(err);
  }
);
