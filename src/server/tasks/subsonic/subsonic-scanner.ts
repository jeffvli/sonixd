import Queue from 'better-queue';

import { prisma } from '../../lib';
import { Server } from '../../types/types';
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

const q = new Queue(
  async (task: any, cb: any) => {
    let res;
    let message = '';

    await prisma.task.update({
      where: { id: task.id },
      data: { inProgress: true },
    });

    if (task.type === 'genre') {
      res = await SubsonicApi.getGenres(task.server);

      const genres = res.genres.genre.map(
        (genre: { value: string; songCount: number; albumCount: number }) => {
          return { name: genre.value };
        }
      );

      const createdGenres = await prisma.genre.createMany({
        data: genres,
        skipDuplicates: true,
      });

      message = `Added ${createdGenres.count} genres.`;
    }

    if (task.type === 'albumArtist') {
      res = await SubsonicApi.getArtists(task.server, {});

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
            serverId: task.server.id,
            imageUrl: artist.artistImageUrl,
          };
        }
      );

      console.log('albumArtists', albumArtists);

      const createdArtists = await prisma.albumArtist.createMany({
        data: albumArtists,
        skipDuplicates: true,
      });

      message = `Added ${createdArtists.count} artists.`;
    }

    if (task.type === 'album') {
      res = await SubsonicApi.getAlbums(task.server, {
        size: 500,
        offset: 0,
      });

      console.log('res.length', res.length);

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
            serverId: task.server.id,
            albumArtistRemoteId: album.artistId,
            remoteCreatedAt: album.created,
            imageUrl: getCoverArtUrl(task.server, album),
          };
        }
      );

      const albumArtistGroups = albums.reduce((groups: any, item: any) => {
        const group = groups[item.albumArtistRemoteId] || [];
        group.push(item);
        groups[item.albumArtistRemoteId] = group;
        return groups;
      }, {});

      const promises: any[] = [];

      const addAlbums = async (a: any, albumArtistRemoteId: string) => {
        const albumArtist = await prisma.albumArtist.findUnique({
          where: {
            uniqueAlbumArtistId: {
              remoteId: albumArtistRemoteId,
              serverId: task.server.id,
            },
          },
        });

        a.forEach(async (album: any) => {
          const t = await prisma.album.upsert({
            where: {
              uniqueAlbumId: {
                remoteId: album.remoteId,
                serverId: task.server.id,
              },
            },
            update: {},
            create: {
              albumArtistId: albumArtist!.id,
              name: album.name,
              year: album.year,
              remoteId: album.remoteId,
              serverId: album.serverId,
              remoteCreatedAt: album.remoteCreatedAt,
              imageUrl: album.imageUrl,
            },
          });

          console.log('t', t);
        });
      };

      Object.keys(albumArtistGroups).forEach((key) => {
        promises.push(addAlbums(albumArtistGroups[key], key));
      });

      await Promise.all(promises);
    }

    await prisma.task.update({
      where: { id: task.id },
      data: { inProgress: false, completed: true, message },
    });

    cb(null, res);
  },
  { maxRetries: 5, filo: true, batchSize: 1, concurrent: 1, maxTimeout: 30000 }
);

const genreTask = async (userId: number, server: Server) => {
  const task = await prisma.task.create({
    data: {
      name: `[${server.name || server.url}]: scan genres `,
      completed: false,
      inProgress: false,
      userId,
    },
  });

  q.push({ id: task.id, server, type: 'genre' });
};

const artistTask = async (userId: number, server: Server) => {
  const task = await prisma.task.create({
    data: {
      name: `[${server.name || server.url}]: scan album artists`,
      completed: false,
      inProgress: false,
      userId,
    },
  });

  q.push({
    id: task.id,
    server,
    type: 'albumArtist',
  });
};

const albumTask = async (userId: number, server: Server) => {
  const task = await prisma.task.create({
    data: {
      name: `[${server.name || server.url}]: scan albums`,
      completed: false,
      inProgress: false,
      userId,
    },
  });

  q.push({
    id: task.id,
    server,
    type: 'album',
  });
};

const fullScan = async (userId: number, server: any) => {
  await genreTask(userId, server);
  await artistTask(userId, server);
  await albumTask(userId, server);
};

const subsonicScanner = {
  fullScan,
};

export default subsonicScanner;
