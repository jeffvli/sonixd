import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const play = async () => {
  const { data } = await api.post('/play');
  return data;
};

const pause = async () => {
  const { data } = await api.post('/pause');
  return data;
};

const info = async () => {
  const { data } = await api.get('/info');
  return data;
};

export const playerApi = {
  info,
  pause,
  play,
};
