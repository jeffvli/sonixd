/* eslint-disable no-await-in-loop */
import { prisma, throttle } from '../../lib';
import { Server } from '../../types/types';
import { groupByProperty } from '../../utils';
import SubsonicApi from './subsonic-api';

const getCoverArtUrl = (server: Server, item: any, size?: number) => {
  if (!item.coverArt && !item.artistImageUrl) {
    return null;
  }

  if (
    !item.coverArt &&
    !item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')
  ) {
    return item.artistImageUrl;
  }

  if (item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')) {
    return null;
  }

  return (
    `${server.url}/getCoverArt.view` +
    `?id=${item.coverArt}` +
    `&v=1.13.0` +
    `&c=sonixd` +
    `${size ? `&size=${size}` : ''}`
  );
};

export const importGenres = async (server: Server) => {
  const res = await SubsonicApi.getGenres(server);

  const genres = res.genres.genre.map(
    (genre: { value: string; songCount: number; albumCount: number }) => {
      return { name: genre.value };
    }
  );

  const createdGenres = await prisma.genre.createMany({
    data: genres,
    skipDuplicates: true,
  });

  return `Added ${createdGenres.count} genres.`;
};

export const importAlbumArtists = async (server: Server) => {
  const res = await SubsonicApi.getArtists(server, {});

  const albumArtists = res.map(
    (artist: {
      id: string;
      name: string;
      albumCount: number;
      artistImageUrl?: string;
    }) => {
      return {
        name: artist.name,
        remoteId: artist.id,
        serverId: server.id,
        imageUrl: artist.artistImageUrl,
      };
    }
  );

  const createdAlbumArtists = await prisma.albumArtist.createMany({
    data: albumArtists,
    skipDuplicates: true,
  });

  const createdArtists = await prisma.artist.createMany({
    data: albumArtists,
    skipDuplicates: true,
  });

  return `Added ${
    createdArtists.count + createdAlbumArtists.count
  } album artists.`;
};

export const importAlbums = async (server: Server) => {
  const promises: any[] = [];
  const res = await SubsonicApi.getAlbums(server, {
    size: 500,
    offset: 0,
  });

  const albums = res.map(
    (album: {
      id: string;
      name: string;
      artist: string;
      artistId: string;
      songCount: number;
      duration: number;
      created: string;
      year: number;
      genre: string;
      userRating?: number;
      starred?: boolean;
    }) => {
      return {
        name: album.name,
        year: album.year,
        favorite: album.starred,
        rating: album.userRating,
        remoteId: album.id,
        serverId: server.id,
        albumArtistRemoteId: album.artistId,
        remoteCreatedAt: album.created,
        imageUrl: getCoverArtUrl(server, album),
        genre: album.genre,
      };
    }
  );

  const albumArtistGroups = groupByProperty(albums, 'albumArtistRemoteId');

  const addAlbums = async (a: any, albumArtistRemoteId: string) => {
    const albumArtist = await prisma.albumArtist.findUnique({
      where: {
        uniqueAlbumArtistId: {
          remoteId: albumArtistRemoteId,
          serverId: server.id,
        },
      },
    });

    if (albumArtist) {
      a.forEach(async (album: any) => {
        await prisma.album.upsert({
          where: {
            uniqueAlbumId: {
              remoteId: album.remoteId,
              serverId: server.id,
            },
          },
          update: {},
          create: {
            albumArtistId: albumArtist.id,
            name: album.name,
            year: album.year,
            remoteId: album.remoteId,
            serverId: album.serverId,
            remoteCreatedAt: album.remoteCreatedAt,
            imageUrl: album.imageUrl,
          },
        });
      });
    }
  };

  Object.keys(albumArtistGroups).forEach((key) => {
    promises.push(addAlbums(albumArtistGroups[key], key));
  });

  await Promise.all(promises);
};

export const importAlbum = async (server: Server, taskId: string) => {
  const promises = [];
  const dbAlbums = await prisma.album.findMany({
    where: {
      serverId: server.id,
    },
  });

  const throttledAlbumFetch = throttle(async (album: any, i: number) => {
    const albumRes = await SubsonicApi.getAlbum(server, {
      id: album.remoteId,
    });

    console.log('fetch', i);
    if (i % 500 === 0) {
      await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data: {
          message: `${String(i)} scanned`,
        },
      });
    }

    if (albumRes) {
      const songDataPromises = albumRes.album.song.map(async (song: any) => {
        if (song.artistId) {
          const artist = await prisma.artist.findUnique({
            where: {
              uniqueArtistId: {
                remoteId: song.artistId,
                serverId: server.id,
              },
            },
          });

          if (artist) {
            return {
              artistName: song.artist,
              name: song.title,
              remoteId: song.id,
              serverId: server.id,
              artistId: artist.id,
            };
          }
        }

        return {
          artistName: song.artist,
          name: song.title,
          remoteId: song.id,
          serverId: server.id,
        };
      });

      const songData = await Promise.all(songDataPromises);

      await prisma.album.update({
        where: {
          uniqueAlbumId: {
            remoteId: albumRes.album.id,
            serverId: server.id,
          },
        },
        data: {
          songs: {
            createMany: {
              data: songData,
              skipDuplicates: true,
            },
          },
        },
      });

      const selectedAlbum = await prisma.album.findUnique({
        where: {
          uniqueAlbumId: {
            remoteId: albumRes.album.id,
            serverId: server.id,
          },
        },
      });

      if (selectedAlbum && albumRes.album.genre) {
        await prisma.genre.upsert({
          where: {
            name: albumRes.album.genre,
          },
          update: {},
          create: {
            name: albumRes.album.genre,
          },
        });

        await prisma.album.update({
          where: {
            id: selectedAlbum.id,
          },
          data: {
            genres: {
              connectOrCreate: {
                where: {
                  genreName_albumId: {
                    albumId: selectedAlbum.id,
                    genreName: albumRes.album.genre,
                  },
                },
                create: {
                  genreName: albumRes.album.genre,
                },
              },
            },
          },
        });
      }

      const songGenrePromises = albumRes.album.song.map(async (song: any) => {
        const selectedSong = await prisma.song.findUnique({
          where: {
            uniqueSongId: {
              remoteId: song.id,
              serverId: server.id,
            },
          },
        });

        if (selectedSong && song.genre) {
          await prisma.song.update({
            where: {
              id: selectedSong.id,
            },
            data: {
              genres: {
                connectOrCreate: {
                  where: {
                    genreName_songId: {
                      genreName: song.genre,
                      songId: selectedSong.id,
                    },
                  },
                  create: {
                    genreName: song.genre,
                  },
                },
              },
            },
          });
        }
      });

      await Promise.all(songGenrePromises);
    }
  });

  for (let i = 0; i < dbAlbums.length; i += 1) {
    promises.push(throttledAlbumFetch(dbAlbums[i], i));
  }

  await Promise.all(promises);
};
