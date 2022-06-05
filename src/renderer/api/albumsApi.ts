import { axios } from 'renderer/lib';
import { AlbumResponse } from './types';

const getAlbum = async (albumId: number) => {
  const { data } = await axios.get<AlbumResponse>(`/albums/${albumId}`);
  return data;
};

export const albumsApi = {
  getAlbum,
};
