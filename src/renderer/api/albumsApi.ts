import axios from 'renderer/lib/axios';

const getAlbum = async (albumId: number) => {
  const { data } = await axios.get(`/albums/${albumId}`);
  return data;
};

export const albumsApi = {
  getAlbum,
};
