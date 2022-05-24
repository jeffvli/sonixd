import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { prisma } from '../../lib';
import { Server, ServerFolder } from '../../types/types';
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

      const genresInsert = genres.Items.map((genre) => {
        return { name: genre.Name };
      });

      const createdGenres = await prisma.genre.createMany({
        data: genresInsert,
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
        const genreInsert = albumArtist.Genres.map((genre) => {
          return { create: { name: genre }, where: { name: genre } };
        });

        const imageInsert = [];
        for (const [key, value] of Object.entries(albumArtist.ImageTags)) {
          imageInsert.push({
            create: { name: key, url: value },
            where: { uniqueImageId: { name: key, url: value } },
          });
        }

        const externalInsert = albumArtist.ExternalUrls.map((external) => {
          return {
            create: { name: external.Name, url: external.Url },
            where: {
              uniqueExternalId: { name: external.Name, url: external.Url },
            },
          };
        });

        await prisma.albumArtist.upsert({
          create: {
            biography: albumArtist.Overview,
            externals: { connectOrCreate: externalInsert },
            genres: { connectOrCreate: genreInsert },
            images: { connectOrCreate: imageInsert },
            name: albumArtist.Name,
            remoteCreatedAt: albumArtist.DateCreated,
            remoteId: albumArtist.Id,
            serverFolderId: serverFolder.id,
          },
          update: {
            biography: albumArtist.Overview,
            externals: { connectOrCreate: externalInsert },
            genres: { connectOrCreate: genreInsert },
            images: { connectOrCreate: imageInsert },
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

// const scanArtists = async (server: Server, serverFolder: ServerFolder) => {
//   const taskId = `[${server.name} (${serverFolder.name})] artists`;

//   q.push({
//     fn: async () => {
//       const task = await prisma.task.create({
//         data: {
//           inProgress: true,
//           name: taskId,
//           serverFolderId: serverFolder.id,
//         },
//       });

//       const artists = await jellyfinApi.getArtists(server, {
//         fields: 'Genres,DateCreated,ExternalUrls,Overview',
//         parentId: serverFolder.remoteId,
//       });

//       for (const artist of artists.Items) {
//         const genreInsert = artist.Genres.map((genre) => {
//           return { create: { name: genre }, where: { name: genre } };
//         });

//         const imageInsert = [];
//         for (const [key, value] of Object.entries(artist.ImageTags)) {
//           imageInsert.push({
//             create: { name: key, url: value },
//             where: { uniqueImageId: { name: key, url: value } },
//           });
//         }

//         const externalInsert = artist.ExternalUrls.map((external) => {
//           return {
//             create: { name: external.Name, url: external.Url },
//             where: {
//               uniqueExternalId: { name: external.Name, url: external.Url },
//             },
//           };
//         });

//         await prisma.artist.upsert({
//           create: {
//             biography: artist.Overview,
//             externals: { connectOrCreate: externalInsert },
//             genres: { connectOrCreate: genreInsert },
//             images: { connectOrCreate: imageInsert },
//             name: artist.Name,
//             remoteCreatedAt: artist.DateCreated,
//             remoteId: artist.Id,
//             serverFolderId: serverFolder.id,
//           },
//           update: {
//             biography: artist.Overview,
//             externals: { connectOrCreate: externalInsert },
//             genres: { connectOrCreate: genreInsert },
//             images: { connectOrCreate: imageInsert },
//             name: artist.Name,
//             remoteCreatedAt: artist.DateCreated,
//             remoteId: artist.Id,
//             serverFolderId: serverFolder.id,
//           },
//           where: {
//             uniqueArtistId: {
//               remoteId: artist.Id,
//               serverFolderId: serverFolder.id,
//             },
//           },
//         });
//       }

//       const message = `Scanned ${artists.Items.length} artists.`;

//       return { message, task };
//     },
//     id: taskId,
//   });
// };

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
          const genreInsert = album.Genres.map((genre) => {
            return { create: { name: genre }, where: { name: genre } };
          });

          const imageInsert = [];
          for (const [key, value] of Object.entries(album.ImageTags)) {
            imageInsert.push({
              create: { name: key, url: value },
              where: { uniqueImageId: { name: key, url: value } },
            });
          }

          const externalInsert = album.ExternalUrls.map((external) => {
            return {
              create: { name: external.Name, url: external.Url },
              where: {
                uniqueExternalId: { name: external.Name, url: external.Url },
              },
            };
          });

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
              externals: { connectOrCreate: externalInsert },
              genres: { connectOrCreate: genreInsert },
              images: { connectOrCreate: imageInsert },
              name: album.Name,
              remoteCreatedAt: album.DateCreated,
              remoteId: album.Id,
              serverFolderId: serverFolder.id,
              year: album.ProductionYear,
            },
            update: {
              albumArtistId: albumArtist?.id,
              date: album.DateCreated,
              externals: { connectOrCreate: externalInsert },
              genres: { connectOrCreate: genreInsert },
              images: { connectOrCreate: imageInsert },
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

const insertSong = async (serverFolder: ServerFolder, song: JFSong) => {
  const genreInsert = song.Genres.map((genre) => {
    return { create: { name: genre }, where: { name: genre } };
  });

  const imageInsert = [];
  for (const [key, value] of Object.entries(song.ImageTags)) {
    imageInsert.push({
      create: { name: key, url: value },
      where: { uniqueImageId: { name: key, url: value } },
    });
  }

  const externalConnect = song.ExternalUrls.map((external) => {
    return {
      uniqueExternalId: { name: external.Name, url: external.Url },
    };
  });

  try {
    const externalCreate = song.ExternalUrls.map((external) => {
      return { name: external.Name, url: external.Url };
    });

    await prisma.external.createMany({
      data: externalCreate,
      skipDuplicates: true,
    });
  } catch (err) {
    console.log(song.Id, 'external');
  }

  try {
    const artistCreate = song.ArtistItems.map((artist) => {
      return {
        name: artist.Name,
        remoteId: artist.Id,
        serverFolderId: serverFolder.id,
      };
    });

    await prisma.artist.createMany({
      data: artistCreate,
      skipDuplicates: true,
    });
  } catch (err) {
    console.log(song.Id, 'artist');
  }

  const artistConnect = song.ArtistItems.map((artist) => {
    return {
      uniqueArtistId: {
        remoteId: artist.Id,
        serverFolderId: serverFolder.id,
      },
    };
  });

  const album = await prisma.album.findUnique({
    where: {
      uniqueAlbumId: {
        remoteId: song.AlbumId,
        serverFolderId: serverFolder.id,
      },
    },
  });

  try {
    await prisma.song.upsert({
      create: {
        albumId: album?.id,
        artists: { connect: artistConnect },
        bitRate: Math.floor(song.MediaSources[0].Bitrate / 1000),
        container: song.MediaSources[0].Container,
        date: song.PremiereDate,
        disc: song.ParentIndexNumber,
        duration: Math.floor(song.MediaSources[0].RunTimeTicks / 1e7),
        externals: { connect: externalConnect },
        genres: { connectOrCreate: genreInsert },
        images: { connectOrCreate: imageInsert },
        name: song.Name,
        remoteCreatedAt: song.DateCreated,
        remoteId: song.Id,
        serverFolderId: serverFolder.id,
        track: song.IndexNumber,
        year: song.ProductionYear,
      },
      update: {
        albumId: album?.id,
        artists: { connect: artistConnect },
        bitRate: Math.floor(song.MediaSources[0].Bitrate / 1000),
        container: song.MediaSources[0].Container,
        date: song.PremiereDate,
        disc: song.ParentIndexNumber,
        duration: Math.floor(song.MediaSources[0].RunTimeTicks / 1e7),
        externals: { connect: externalConnect },
        genres: { connectOrCreate: genreInsert },
        images: { connectOrCreate: imageInsert },
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
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      console.log(song.Id, 'song');
    }
  }
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
          sortBy: 'DateCreated',
          sortOrder: 'Descending',
          startIndex: i * chunkSize,
        });

        for (const song of songs.Items) {
          await insertSong(serverFolder, song);
        }

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
