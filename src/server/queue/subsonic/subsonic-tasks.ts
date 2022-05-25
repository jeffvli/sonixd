/* eslint-disable no-await-in-loop */
import { prisma, throttle } from '../../lib';
import { Server, ServerFolder } from '../../types/types';
import { groupByProperty, uniqueArray } from '../../utils';
import { q } from '../scanner-queue';
import { subsonicApi } from './subsonic-api';
import { SSAlbumListEntry } from './subsonic-types';

// const getCoverArtUrl = (server: Server, item: any, size?: number) => {
//   if (!item.coverArt && !item.artistImageUrl) {
//     return null;
//   }

//   if (
//     !item.coverArt &&
//     !item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')
//   ) {
//     return item.artistImageUrl;
//   }

//   if (item.artistImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')) {
//     return null;
//   }

//   return (
//     `${server.url}/getCoverArt.view` +
//     `?id=${item.coverArt}` +
//     `&v=1.13.0` +
//     `&c=sonixd` +
//     `${size ? `&size=${size}` : ''}`
//   );
// };

export const scanGenres = async (
  server: Server,
  serverFolder: ServerFolder
) => {
  const taskId = `[${server.name} (${serverFolder.name})] genres`;

  q.push({
    fn: async () => {
      const task = await prisma.task.create({
        data: {
          inProgress: true,
          name: taskId,
          serverFolderId: serverFolder.id,
        },
      });

      const res = await subsonicApi.getGenres(server);

      const genres = res.genres.genre.map((genre) => {
        return { name: genre.value };
      });

      const createdGenres = await prisma.genre.createMany({
        data: genres,
        skipDuplicates: true,
      });

      const message = `Imported ${createdGenres.count} new genres.`;

      return { message, task };
    },
    id: taskId,
  });
};

export const scanAlbumArtists = async (
  server: Server,
  serverFolder: ServerFolder
) => {
  const taskId = `[${server.name} (${serverFolder.name})] album artists`;

  q.push({
    fn: async () => {
      const task = await prisma.task.create({
        data: {
          inProgress: true,
          name: taskId,
          serverFolderId: serverFolder.id,
        },
      });

      const artists = await subsonicApi.getArtists(
        server,
        serverFolder.remoteId
      );

      for (const artist of artists) {
        await prisma.albumArtist.upsert({
          create: {
            name: artist.name,
            remoteId: artist.id,
            serverFolderId: serverFolder.id,
          },
          update: {
            name: artist.name,
            remoteId: artist.id,
            serverFolderId: serverFolder.id,
          },
          where: {
            uniqueAlbumArtistId: {
              remoteId: artist.id,
              serverFolderId: serverFolder.id,
            },
          },
        });

        await prisma.artist.upsert({
          create: {
            name: artist.name,
            remoteId: artist.id,
            serverFolderId: serverFolder.id,
          },
          update: {
            name: artist.name,
            remoteId: artist.id,
            serverFolderId: serverFolder.id,
          },
          where: {
            uniqueArtistId: {
              remoteId: artist.id,
              serverFolderId: serverFolder.id,
            },
          },
        });
      }

      const message = `Scanned ${artists.length} album artists.`;

      return { message, task };
    },
    id: taskId,
  });
};

export const scanAlbums = async (
  server: Server,
  serverFolder: ServerFolder
) => {
  const taskId = `[${server.name} (${serverFolder.name})] albums`;

  q.push({
    fn: async () => {
      const task = await prisma.task.create({
        data: {
          inProgress: true,
          name: taskId,
          serverFolderId: serverFolder.id,
        },
      });

      const promises: any[] = [];
      const albums = await subsonicApi.getAlbums(server, {
        musicFolderId: serverFolder.id,
        offset: 0,
        size: 500,
        type: 'newest',
      });

      const albumArtistGroups = groupByProperty(albums, 'artistId');

      const addAlbums = async (
        a: SSAlbumListEntry[],
        albumArtistRemoteId: string
      ) => {
        const albumArtist = await prisma.albumArtist.findUnique({
          where: {
            uniqueAlbumArtistId: {
              remoteId: albumArtistRemoteId,
              serverFolderId: serverFolder.id,
            },
          },
        });

        if (albumArtist) {
          a.forEach(async (album) => {
            const imagesConnectOrCreate = album.coverArt
              ? {
                  create: { name: 'Primary', url: album.coverArt },
                  where: {
                    uniqueImageId: { name: 'Primary', url: album.coverArt },
                  },
                }
              : [];

            await prisma.album.upsert({
              create: {
                albumArtistId: albumArtist.id,
                images: { connectOrCreate: imagesConnectOrCreate },
                name: album.title,
                remoteCreatedAt: album.created,
                remoteId: album.id,
                serverFolderId: serverFolder.id,
                year: album.year,
              },
              update: {
                albumArtistId: albumArtist.id,
                images: { connectOrCreate: imagesConnectOrCreate },
                name: album.title,
                remoteCreatedAt: album.created,
                remoteId: album.id,
                serverFolderId: serverFolder.id,
                year: album.year,
              },
              where: {
                uniqueAlbumId: {
                  remoteId: album.id,
                  serverFolderId: serverFolder.id,
                },
              },
            });
          });
        }
      };

      Object.keys(albumArtistGroups).forEach((key) => {
        promises.push(addAlbums(albumArtistGroups[key], key));
      });

      await Promise.all(promises);

      const message = `Scanned ${albums.length} albums.`;

      return { message, task };
    },
    id: taskId,
  });
};

const throttledAlbumFetch = throttle(
  async (server: Server, serverFolder: ServerFolder, album: any, i: number) => {
    const albumRes = await subsonicApi.getAlbum(server, album.remoteId);

    console.log('fetch', i);

    if (albumRes) {
      const songsUpsert = albumRes.album.song.map((song) => {
        const genresConnectOrCreate = song.genre
          ? {
              create: { name: song.genre },
              where: { name: song.genre },
            }
          : [];

        const imagesConnectOrCreate = song.coverArt
          ? {
              create: { name: 'Primary', url: song.coverArt },
              where: { uniqueImageId: { name: 'Primary', url: song.coverArt } },
            }
          : [];

        const artistsConnect = song.artistId
          ? {
              uniqueArtistId: {
                remoteId: song.artistId,
                serverFolderId: serverFolder.id,
              },
            }
          : [];

        return {
          create: {
            artistName: !song.artistId ? song.artist : undefined,
            artists: { connect: artistsConnect },
            bitRate: song.bitRate,
            container: song.suffix,
            disc: song.discNumber,
            duration: song.duration,
            genres: { connectOrCreate: genresConnectOrCreate },
            images: { connectOrCreate: imagesConnectOrCreate },
            name: song.title,
            remoteCreatedAt: song.created,
            remoteId: song.id,
            serverFolderId: serverFolder.id,
            track: song.track,
            year: song.year,
          },
          update: {
            artistName: !song.artistId ? song.artist : undefined,
            artists: { connect: artistsConnect },
            bitRate: song.bitRate,
            container: song.suffix,
            disc: song.discNumber,
            duration: song.duration,
            genres: { connectOrCreate: genresConnectOrCreate },
            images: { connectOrCreate: imagesConnectOrCreate },
            name: song.title,
            remoteCreatedAt: song.created,
            remoteId: song.id,
            track: song.track,
            year: song.year,
          },
          where: {
            uniqueSongId: {
              remoteId: song.id,
              serverFolderId: serverFolder.id,
            },
          },
        };
      });

      const uniqueArtistIds = albumRes.album.song
        .map((song) => song.artistId)
        .filter(uniqueArray);

      const artistsConnect = uniqueArtistIds.map((artistId) => {
        return {
          uniqueArtistId: {
            remoteId: artistId!,
            serverFolderId: serverFolder.id,
          },
        };
      });

      try {
        await prisma.album.update({
          data: {
            artists: { connect: artistsConnect },
            songs: { upsert: songsUpsert },
          },
          where: {
            uniqueAlbumId: {
              remoteId: albumRes.album.id,
              serverFolderId: serverFolder.id,
            },
          },
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
);

export const scanAlbumDetail = async (
  server: Server,
  serverFolder: ServerFolder
) => {
  const taskId = `[${server.name} (${serverFolder.name})] albums detail`;

  q.push({
    fn: async () => {
      const task = await prisma.task.create({
        data: {
          inProgress: true,
          name: taskId,
          serverFolderId: serverFolder.id,
        },
      });

      const promises = [];
      const dbAlbums = await prisma.album.findMany({
        where: { serverFolderId: serverFolder.id },
      });

      for (let i = 0; i < dbAlbums.length; i += 1) {
        promises.push(
          throttledAlbumFetch(server, serverFolder, dbAlbums[i], i)
        );
      }

      await Promise.all(promises);
      const message = `Scanned ${dbAlbums.length} albums.`;

      return { message, task };
    },
    id: taskId,
  });
};

const throttledArtistDetailFetch = throttle(
  async (
    server: Server,
    artistId: number,
    artistRemoteId: string,
    i: number
  ) => {
    console.log('artisdetail', i);

    const artistInfo = await subsonicApi.getArtistInfo(server, artistRemoteId);

    const externalsConnectOrCreate = [];
    if (artistInfo.artistInfo2.lastFmUrl) {
      externalsConnectOrCreate.push({
        create: {
          name: 'Last.fm',
          url: artistInfo.artistInfo2.lastFmUrl,
        },
        where: {
          uniqueExternalId: {
            name: 'Last.fm',
            url: artistInfo.artistInfo2.lastFmUrl,
          },
        },
      });
    }

    if (artistInfo.artistInfo2.musicBrainzId) {
      externalsConnectOrCreate.push({
        create: {
          name: 'MusicBrainz',
          url: `https://musicbrainz.org/artist/${artistInfo.artistInfo2.musicBrainzId}`,
        },
        where: {
          uniqueExternalId: {
            name: 'MusicBrainz',
            url: `https://musicbrainz.org/artist/${artistInfo.artistInfo2.musicBrainzId}`,
          },
        },
      });
    }

    try {
      await prisma.albumArtist.update({
        data: {
          biography: artistInfo.artistInfo2.biography,
          externals: { connectOrCreate: externalsConnectOrCreate },
        },
        where: { id: artistId },
      });
    } catch (err) {
      console.log(err);
    }
  }
);

export const scanAlbumArtistDetail = async (
  server: Server,
  serverFolder: ServerFolder
) => {
  const taskId = `[${server.name} (${serverFolder.name})] artists detail`;

  q.push({
    fn: async () => {
      const task = await prisma.task.create({
        data: {
          inProgress: true,
          name: taskId,
          serverFolderId: serverFolder.id,
        },
      });

      const promises = [];
      const dbArtists = await prisma.albumArtist.findMany({
        where: { serverFolderId: serverFolder.id },
      });

      for (let i = 0; i < dbArtists.length; i += 1) {
        promises.push(
          throttledArtistDetailFetch(
            server,
            dbArtists[i].id,
            dbArtists[i].remoteId,
            i
          )
        );
      }

      return { task };
    },
    id: taskId,
  });
};

const scanAll = async (server: Server, serverFolder: ServerFolder) => {
  await scanGenres(server, serverFolder);
  await scanAlbumArtists(server, serverFolder);
  await scanAlbumArtistDetail(server, serverFolder);
  await scanAlbums(server, serverFolder);
  await scanAlbumDetail(server, serverFolder);
  // await scanSongs(server, serverFolder);
};

export const subsonicTasks = {
  scanAll,
  scanGenres,
};
