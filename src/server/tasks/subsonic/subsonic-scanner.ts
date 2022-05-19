import Queue from 'better-queue';

import { prisma } from '../../lib';
import { Server, ServerFolder } from '../../types/types';
import {
  importAlbumDetail,
  importAlbumArtists,
  importAlbums,
  importGenres,
} from './subsonic-tasks';

const q = new Queue(
  async (
    task: {
      id: string;
      dbId: number;
      server: Server;
      serverFolder: ServerFolder;
      type: 'genres' | 'albumArtists' | 'albums' | 'albumDetail';
    },
    cb: any
  ) => {
    await prisma.task.update({
      where: { id: task.dbId },
      data: { inProgress: true, completed: false },
    });

    if (task.type === 'genres') {
      await importGenres(task.server);
    }

    if (task.type === 'albumArtists') {
      await importAlbumArtists(task.server, task.serverFolder);
    }

    if (task.type === 'albums') {
      await importAlbums(task.server, task.serverFolder);
    }

    if (task.type === 'albumDetail') {
      await importAlbumDetail(task.server, task.serverFolder, task.dbId);
    }

    await cb(null, task);
  },
  {
    filo: true,
    batchSize: 1,
    concurrent: 1,
    maxTimeout: 60000,
  }
);

q.on('task_finish', async (_taskId, result) => {
  await prisma.task.update({
    where: { id: Number(result.dbId) },
    data: { inProgress: false, completed: true },
  });
});

// const scannerTask = async (
//   userId: number,
//   server: Server,
//   type: 'genres' | 'albumArtists' | 'albums' | 'album'
// ) => {
//   const task = await prisma.task.create({
//     data: {
//       name: `[${server.name || server.url}]: scan ${type}`,
//       completed: false,
//       inProgress: false,
//       userId,
//     },
//   });

//   q.push({ id: task.id, server, type });
// };

const fullScan = async (userId: number, server: Server) => {
  const task = await prisma.task.create({
    data: {
      name: `[${server.name || server.url}]: fullscan`,
      completed: false,
      inProgress: false,
      userId,
    },
  });

  const args = {
    id: 'fullscan',
    dbId: task.id,
    server,
  };

  if (server.serverFolder) {
    server.serverFolder
      .filter((folder) => folder.enabled)
      .forEach((folder) => {
        q.push({
          ...args,
          serverFolder: folder,
          type: 'genres',
        }).on('finish', () => {
          q.push({
            ...args,
            serverFolder: folder,
            type: 'albumArtists',
          }).on('finish', () => {
            q.push({
              ...args,
              serverFolder: folder,
              type: 'albums',
            }).on('finish', () => {
              q.push({
                ...args,
                server,
                serverFolder: folder,
                type: 'albumDetail',
              });
            });
          });
        });
      });
  }
};

q.on('task_progress', (taskId, completed, total) => {
  console.log('taskId', taskId);
  console.log('completed', completed);
  console.log('total', total);
});

const subsonicScanner = {
  fullScan,
};

export default subsonicScanner;
