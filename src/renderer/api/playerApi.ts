import axios from 'axios';
import { io } from 'socket.io-client';
import { Song } from 'types';

export const socket = io('http://localhost:5000', {
  reconnectionDelayMax: 10000,
});

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const info = async () => {
  const { data } = await api.get('/info');
  return data;
};

const play = async () => {
  socket.emit('player_play');
};

const pause = async () => {
  socket.emit('player_pause');
};

const stop = async () => {
  socket.emit('player_stop');
};

const previous = async (currentSong: Song, nextSong: Song) => {
  socket.emit('player_previous', currentSong.streamUrl, nextSong.streamUrl);
};

const next = async (currentSong: Song, nextSong: Song) => {
  socket.emit('player_next', currentSong.streamUrl, nextSong.streamUrl);
};

const setQueue = async (currentSong: Song, nextSong: Song) => {
  socket.emit('queue', currentSong.streamUrl, nextSong.streamUrl);
};

const seek = async (seconds: number) => {
  socket.emit('player_seek', seconds);
};

const volume = async (seconds: number, vol: number) => {
  socket.emit('player_volume', seconds, vol / 100);
};

export const playerApi = {
  info,
  next,
  pause,
  play,
  previous,
  seek,
  setQueue,
  stop,
  volume,
};
