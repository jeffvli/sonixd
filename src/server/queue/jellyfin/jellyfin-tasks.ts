import { prisma } from '../../lib';
import { Server, ServerFolder, Task } from '../../types/types';
import { groupByProperty, uniqueArray } from '../../utils';
import { completeTask, q } from '../scanner-queue';
import { jellyfinApi } from './jellyfin-api';
import { JFSong } from './jellyfin-types';

const scanGenres = async (
  server: Server,
  serverFolder: ServerFolder,
  task: Task
) => {
  const taskId = `[${server.name} (${serverFolder.name})] genres`;

  q.push({
    fn: async () => {
      await prisma.task.update({
        data: { message: 'Scanning genres' },
        where: { id: task.id },
      });

      const genres = await jellyfinApi.getGenres(server, {
        parentId: serverFolder.remoteId,
      });

      const genresCreate = genres.Items.map((genre) => {
        return { name: genre.Name };
      });

      await prisma.genre.createMany({
        data: genresCreate,
        skipDuplicates: true,
      });

      return { task };
    },
    id: taskId,
  });
};

const scanAlbumArtists = async (
  server: Server,
  serverFolder: ServerFolder,
  task: Task
) => {
  const taskId = `[${server.name} (${serverFolder.name})] album artists`;

  q.push({
    fn: async () => {
      await prisma.task.update({
        data: { message: 'Scanning album artists' },
        where: { id: task.id },
      });
      const albumArtists = await jellyfinApi.getAlbumArtists(server, {
        fields: 'Genres,DateCreated,ExternalUrls,Overview',
        parentId: serverFolder.remoteId,
      });

      for (const albumArtist of albumArtists.Items) {
        const genresConnectOrCreate = albumArtist.Genres.map((genre) => {
          return { create: { name: genre }, where: { name: genre } };
        });

        const imagesConnectOrCreate = [];
        for (const [key, value] of Object.entries(albumArtist.ImageTags)) {
          imagesConnectOrCreate.push({
            create: { name: key, url: value },
            where: { uniqueImageId: { name: key, url: value } },
          });
        }

        const externalsConnectOrCreate = albumArtist.ExternalUrls.map(
          (external) => {
            return {
              create: { name: external.Name, url: external.Url },
              where: {
                uniqueExternalId: { name: external.Name, url: external.Url },
              },
            };
          }
        );

        await prisma.albumArtist.upsert({
          create: {
            biography: albumArtist.Overview,
            externals: { connectOrCreate: externalsConnectOrCreate },
            genres: { connectOrCreate: genresConnectOrCreate },
            images: { connectOrCreate: imagesConnectOrCreate },
            name: albumArtist.Name,
            remoteCreatedAt: albumArtist.DateCreated,
            remoteId: albumArtist.Id,
            serverFolderId: serverFolder.id,
          },
          update: {
            biography: albumArtist.Overview,
            deleted: false,
            externals: { connectOrCreate: externalsConnectOrCreate },
            genres: { connectOrCreate: genresConnectOrCreate },
            images: { connectOrCreate: imagesConnectOrCreate },
            name: albumArtist.Name,
            remoteCreatedAt: albumArtist.DateCreated,
            remoteId: albumArtist.Id,
            serverFolderId: serverFolder.id,
          },
          where: {
            uniqueAlbumArtistId: {
              remoteId: albumArtist.Id,
              serverFolderId: serverFolder.id,
            },
          },
        });
      }

      return { task };
    },
    id: taskId,
  });
};

const scanAlbums = async (
  server: Server,
  serverFolder: ServerFolder,
  task: Task
) => {
  const check = await jellyfinApi.getAlbums(server, {
    enableUserData: false,
    includeItemTypes: 'MusicAlbum',
    limit: 1,
    parentId: serverFolder.remoteId,
    recursive: true,
  });

  const albumCount = check.TotalRecordCount;
  const chunkSize = 5000;
  const albumChunkCount = Math.ceil(albumCount / chunkSize);

  const taskId = `(${task.id}) [${server.name} (${serverFolder.name})] albums`;

  q.push({
    fn: async () => {
      await prisma.task.update({
        data: { message: 'Scanning albums' },
        where: { id: task.id },
      });

      for (let i = 0; i < albumChunkCount; i += 1) {
        const albums = await jellyfinApi.getAlbums(server, {
          enableImageTypes: 'Primary,Logo,Backdrop',
          enableUserData: false,
          fields: 'Genres,DateCreated,ExternalUrls,Overview',
          imageTypeLimit: 1,
          limit: chunkSize,
          parentId: serverFolder.remoteId,
          recursive: true,
          startIndex: i * chunkSize,
        });

        for (const album of albums.Items) {
          const genresConnectOrCreate = album.Genres.map((genre) => {
            return { create: { name: genre }, where: { name: genre } };
          });

          const imagesConnectOrCreate = [];
          for (const [key, value] of Object.entries(album.ImageTags)) {
            imagesConnectOrCreate.push({
              create: { name: key, url: value },
              where: { uniqueImageId: { name: key, url: value } },
            });
          }

          const externalsConnectOrCreate = album.ExternalUrls.map(
            (external) => {
              return {
                create: { name: external.Name, url: external.Url },
                where: {
                  uniqueExternalId: { name: external.Name, url: external.Url },
                },
              };
            }
          );

          const albumArtist =
            album.AlbumArtists.length > 0
              ? await prisma.albumArtist.findUnique({
                  where: {
                    uniqueAlbumArtistId: {
                      remoteId: album.AlbumArtists && album.AlbumArtists[0].Id,
                      serverFolderId: serverFolder.id,
                    },
                  },
                })
              : undefined;

          await prisma.album.upsert({
            create: {
              albumArtistId: albumArtist?.id,
              date: album.DateCreated,
              externals: { connectOrCreate: externalsConnectOrCreate },
              genres: { connectOrCreate: genresConnectOrCreate },
              images: { connectOrCreate: imagesConnectOrCreate },
              name: album.Name,
              remoteCreatedAt: album.DateCreated,
              remoteId: album.Id,
              serverFolderId: serverFolder.id,
              year: album.ProductionYear,
            },
            update: {
              albumArtistId: albumArtist?.id,
              date: album.DateCreated,
              deleted: false,
              externals: { connectOrCreate: externalsConnectOrCreate },
              genres: { connectOrCreate: genresConnectOrCreate },
              images: { connectOrCreate: imagesConnectOrCreate },
              name: album.Name,
              remoteCreatedAt: album.DateCreated,
              remoteId: album.Id,
              serverFolderId: serverFolder.id,
              year: album.ProductionYear,
            },
            where: {
              uniqueAlbumId: {
                remoteId: album.Id,
                serverFolderId: serverFolder.id,
              },
            },
          });
        }

        const currentTask = await prisma.task.findUnique({
          where: { id: task.id },
        });

        const newCount =
          Number(currentTask?.progress || 0) + Number(albums.Items.length);

        await prisma.task.update({
          data: { progress: String(newCount) },
          where: { id: task.id },
        });
      }

      return { task };
    },
    id: taskId,
  });
};

const insertSongGroup = async (
  serverFolder: ServerFolder,
  songs: JFSong[],
  remoteAlbumId: string
) => {
  const songsUpsert = songs.map((song) => {
    const artistsConnectOrCreate = song.ArtistItems.map((artist) => {
      return {
        create: {
          name: artist.Name,
          remoteId: artist.Id,
          serverFolderId: serverFolder.id,
        },
        where: {
          uniqueArtistId: {
            remoteId: artist.Id,
            serverFolderId: serverFolder.id,
          },
        },
      };
    });

    const genresConnectOrCreate = song.Genres.map((genre) => {
      return { create: { name: genre }, where: { name: genre } };
    });

    const imagesConnectOrCreate = [];
    for (const [key, value] of Object.entries(song.ImageTags)) {
      imagesConnectOrCreate.push({
        create: { name: key, url: value },
        where: { uniqueImageId: { name: key, url: value } },
      });
    }

    const externalsConnectOrCreate = song.ExternalUrls.map((external) => {
      return {
        create: { name: external.Name, url: external.Url },
        where: {
          uniqueExternalId: { name: external.Name, url: external.Url },
        },
      };
    });

    return {
      create: {
        artists: { connectOrCreate: artistsConnectOrCreate },
        bitRate: Math.floor(song.MediaSources[0].Bitrate / 1000),
        container: song.MediaSources[0].Container,
        date: song.PremiereDate,
        disc: song.ParentIndexNumber,
        duration: Math.floor(song.MediaSources[0].RunTimeTicks / 1e7),
        externals: { connectOrCreate: externalsConnectOrCreate },
        genres: { connectOrCreate: genresConnectOrCreate },
        images: { connectOrCreate: imagesConnectOrCreate },
        name: song.Name,
        remoteCreatedAt: song.DateCreated,
        remoteId: song.Id,
        serverFolderId: serverFolder.id,
        track: song.IndexNumber,
        year: song.ProductionYear,
      },
      update: {
        artists: { connectOrCreate: artistsConnectOrCreate },
        bitRate: Math.floor(song.MediaSources[0].Bitrate / 1000),
        container: song.MediaSources[0].Container,
        date: song.PremiereDate,
        disc: song.ParentIndexNumber,
        duration: Math.floor(song.MediaSources[0].RunTimeTicks / 1e7),
        externals: { connectOrCreate: externalsConnectOrCreate },
        genres: { connectOrCreate: genresConnectOrCreate },
        images: { connectOrCreate: imagesConnectOrCreate },
        name: song.Name,
        remoteCreatedAt: song.DateCreated,
        remoteId: song.Id,
        serverFolderId: serverFolder.id,
        track: song.IndexNumber,
        year: song.ProductionYear,
      },
      where: {
        uniqueSongId: {
          remoteId: song.Id,
          serverFolderId: serverFolder.id,
        },
      },
    };
  });

  const artists = songs.flatMap((song) => {
    return song.ArtistItems.map((artist) => ({
      name: artist.Name,
      remoteId: artist.Id,
      serverFolderId: serverFolder.id,
    }));
  });

  const uniqueArtistIds = songs
    .flatMap((song) => {
      return song.ArtistItems.flatMap((artist) => artist.Id);
    })
    .filter(uniqueArray);

  const artistsConnect = uniqueArtistIds.map((artistId) => {
    return {
      uniqueArtistId: {
        remoteId: artistId!,
        serverFolderId: serverFolder.id,
      },
    };
  });

  await prisma.$transaction([
    prisma.artist.createMany({
      data: artists,
      skipDuplicates: true,
    }),
    prisma.artist.updateMany({
      data: { deleted: false },
      where: {
        remoteId: { in: uniqueArtistIds },
        serverFolderId: serverFolder.id,
      },
    }),
    prisma.album.update({
      data: {
        artists: { connect: artistsConnect },
        deleted: false,
        songs: { upsert: songsUpsert },
      },
      where: {
        uniqueAlbumId: {
          remoteId: remoteAlbumId,
          serverFolderId: serverFolder.id,
        },
      },
    }),
  ]);
};

const scanSongs = async (
  server: Server,
  serverFolder: ServerFolder,
  task: Task
) => {
  const check = await jellyfinApi.getSongs(server, {
    enableUserData: false,
    limit: 0,
    parentId: serverFolder.remoteId,
    recursive: true,
  });

  // Fetch in chunks
  const songCount = check.TotalRecordCount;
  const chunkSize = 10000;
  const songChunkCount = Math.ceil(songCount / chunkSize);
  const taskId = `[${server.name} (${serverFolder.name})] songs`;

  q.push({
    fn: async () => {
      await prisma.task.update({
        data: { message: 'Scanning songs' },
        where: { id: task.id },
      });

      for (let i = 0; i < songChunkCount; i += 1) {
        const songs = await jellyfinApi.getSongs(server, {
          enableImageTypes: 'Primary,Logo,Backdrop',
          enableUserData: false,
          fields: 'Genres,DateCreated,ExternalUrls,MediaSources',
          imageTypeLimit: 1,
          limit: chunkSize,
          parentId: serverFolder.remoteId,
          recursive: true,
          sortBy: 'DateCreated,Album',
          sortOrder: 'Descending',
          startIndex: i * chunkSize,
        });

        const albumSongGroups = groupByProperty(songs.Items, 'AlbumId');

        const keys = Object.keys(albumSongGroups);

        for (let b = 0; b < keys.length; b += 1) {
          const songGroup = albumSongGroups[keys[b]];
          await insertSongGroup(serverFolder, songGroup, keys[b]);

          const currentTask = await prisma.task.findUnique({
            where: { id: task.id },
          });

          const newCount =
            Number(currentTask?.progress || 0) + Number(songGroup.length);

          await prisma.task.update({
            data: { progress: String(newCount) },
            where: { id: task.id },
          });
        }
      }

      return { completed: true, task };
    },
    id: taskId,
  });
};

const checkDeleted = async (task: Task, serverFolder: ServerFolder) => {
  q.push({
    fn: async () => {
      await prisma.$transaction([
        prisma.albumArtist.updateMany({
          data: { deleted: true },
          where: {
            serverFolderId: serverFolder.id,
            updatedAt: { lte: task.createdAt },
          },
        }),
        prisma.artist.updateMany({
          data: { deleted: true },
          where: {
            serverFolderId: serverFolder.id,
            updatedAt: { lte: task.createdAt },
          },
        }),
        prisma.album.updateMany({
          data: { deleted: true },
          where: {
            serverFolderId: serverFolder.id,
            updatedAt: { lte: task.createdAt },
          },
        }),
        prisma.song.updateMany({
          data: { deleted: true },
          where: {
            serverFolderId: serverFolder.id,
            updatedAt: { lte: task.createdAt },
          },
        }),
      ]);
    },
    id: `${task.id}-difference`,
  });
};

const scanAll = async (
  server: Server,
  serverFolder: ServerFolder,
  task: Task
) => {
  await scanGenres(server, serverFolder, task);
  await scanAlbumArtists(server, serverFolder, task);
  await scanAlbums(server, serverFolder, task);
  await scanSongs(server, serverFolder, task);
  await checkDeleted(task, serverFolder);
  await completeTask(task);
};

export const jellyfinTasks = {
  scanAlbumArtists,
  scanAlbums,
  scanAll,
  scanGenres,
  scanSongs,
};
