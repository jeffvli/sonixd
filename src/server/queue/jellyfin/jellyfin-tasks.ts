import { prisma } from '../../lib';
import { Server, ServerFolder } from '../../types/types';
import { groupByProperty, uniqueArray } from '../../utils';
import { q } from '../scanner-queue';
import { jellyfinApi } from './jellyfin-api';
import { JFSong } from './jellyfin-types';

const scanGenres = async (server: Server, serverFolder: ServerFolder) => {
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

      const genres = await jellyfinApi.getGenres(server, {
        parentId: serverFolder.remoteId,
      });

      const genresCreate = genres.Items.map((genre) => {
        return { name: genre.Name };
      });

      const createdGenres = await prisma.genre.createMany({
        data: genresCreate,
        skipDuplicates: true,
      });

      const message = `Imported ${createdGenres.count} new genres.`;

      return { message, task };
    },
    id: taskId,
  });
};

const scanAlbumArtists = async (server: Server, serverFolder: ServerFolder) => {
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

      const message = `Scanned ${albumArtists.Items.length} album artists.`;

      return { message, task };
    },
    id: taskId,
  });
};

const scanAlbums = async (server: Server, serverFolder: ServerFolder) => {
  const check = await jellyfinApi.getAlbums(server, {
    enableUserData: false,
    includeItemTypes: 'MusicAlbum',
    limit: 1,
    parentId: serverFolder.remoteId,
    recursive: true,
  });

  // Fetch in chunks of 5000 entries
  const albumCount = check.TotalRecordCount;
  const chunkSize = 5000;
  const albumChunkCount = Math.ceil(albumCount / chunkSize);

  for (let i = 0; i < albumChunkCount; i += 1) {
    const taskId = `[${server.name} (${serverFolder.name})] albums-page-${i}`;

    q.push({
      fn: async () => {
        const task = await prisma.task.create({
          data: {
            inProgress: true,
            name: taskId,
            serverFolderId: serverFolder.id,
          },
        });

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

        const message = `Scanned ${albums.Items.length} albums.`;

        return { message, task };
      },
      id: taskId,
    });
  }
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

  await prisma.album.update({
    data: {
      artists: { connect: artistsConnect },
      songs: { upsert: songsUpsert },
    },
    where: {
      uniqueAlbumId: {
        remoteId: remoteAlbumId,
        serverFolderId: serverFolder.id,
      },
    },
  });
};

const scanSongs = async (server: Server, serverFolder: ServerFolder) => {
  const check = await jellyfinApi.getSongs(server, {
    enableUserData: false,
    limit: 0,
    parentId: serverFolder.remoteId,
    recursive: true,
  });

  // Fetch in chunks of 5000 entries
  const songCount = check.TotalRecordCount;
  const chunkSize = 5000;
  const songChunkCount = Math.ceil(songCount / chunkSize);

  for (let i = 0; i < songChunkCount; i += 1) {
    const taskId = `[${server.name} (${serverFolder.name})] songs-page-${i}`;

    q.push({
      fn: async () => {
        const task = await prisma.task.create({
          data: {
            inProgress: true,
            name: taskId,
            serverFolderId: serverFolder.id,
          },
        });

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

        const promises: any[] = [];
        Object.keys(albumSongGroups).forEach(async (key) => {
          promises.push(
            insertSongGroup(serverFolder, albumSongGroups[key], key)
          );
        });

        await Promise.all(promises);

        const message = `Scanned ${songs.Items.length} songs.`;

        return { message, task };
      },
      id: taskId,
    });
  }
};

const scanAll = async (server: Server, serverFolder: ServerFolder) => {
  await scanGenres(server, serverFolder);
  await scanAlbumArtists(server, serverFolder);
  await scanAlbums(server, serverFolder);
  await scanSongs(server, serverFolder);
};

export const jellyfinTasks = {
  scanAlbumArtists,
  scanAlbums,
  scanAll,
  scanGenres,
  scanSongs,
};
