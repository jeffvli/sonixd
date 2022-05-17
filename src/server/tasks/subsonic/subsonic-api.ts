import axios from 'axios';

import { Server } from '../../types/types';

const api = axios.create({
  validateStatus: (status) => status >= 200,
});

api.interceptors.response.use(
  (res: any) => {
    res.data = res.data['subsonic-response'];
    return res;
  },
  (err: any) => {
    return Promise.reject(err);
  }
);

const getArtists = async (
  server: Server,
  options: {
    musicFolderId?: string | number;
  }
) => {
  const { data } = await api.get(
    `${server.url}/rest/getArtists.view?v=1.13.0&c=sonixd&f=json&${server.token}`,
    { params: options }
  );

  const artists = (data.artists?.index || []).flatMap(
    (index: any) => index.artist
  );

  return artists;
};

const getGenres = async (server: Server) => {
  const { data: genres } = await api.get(
    `${server.url}/rest/getGenres.view?v=1.13.0&c=sonixd&f=json&${server.token}`
  );

  return genres;
};

const getAlbums = async (
  server: Server,
  options: {
    size: number;
    offset: number;
    musicFolderId?: string | number;
  },
  recursiveData: any[] = []
) => {
  const albums: any = api
    .get(
      `${server.url}/rest/getAlbumList2.view?v=1.13.0&c=sonixd&f=json&${server.token}`,
      {
        params: {
          type: 'newest',
          size: options.size,
          offset: options.offset,
        },
      }
    )
    .then((res) => {
      if (
        !res.data.albumList2.album ||
        res.data.albumList2.album.length === 0
      ) {
        // Flatten and return once there are no more albums left
        return recursiveData.flatMap((album) => [...album]);
      }

      // On every iteration, push the existing combined album array and increase the offset
      recursiveData.push(res.data.albumList2.album);
      return getAlbums(
        server,
        {
          size: options.size,
          offset: options.offset + options.size,
        },
        recursiveData
      );
    })
    .catch((err) => console.log(err));

  return albums;
};

const SubsonicApi = {
  getAlbums,
  getArtists,
  getGenres,
};

export default SubsonicApi;
