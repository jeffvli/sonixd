import Queue from 'better-queue';

import { prisma } from '../../lib';
import {
  importAlbum,
  importAlbumArtists,
  importAlbums,
  importGenres,
} from './subsonic-tasks';

const q = new Queue(
  async (task: any, cb: any) => {
    await prisma.task.update({
      where: { id: task.dbId },
      data: { inProgress: true, completed: false },
    });

    if (task.type === 'genres') {
      await importGenres(task.server);
    }

    if (task.type === 'albumArtists') {
      await importAlbumArtists(task.server);
    }

    if (task.type === 'albums') {
      await importAlbums(task.server);
    }

    if (task.type === 'album') {
      await importAlbum(task.server, task.dbId);
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

const fullScan = async (userId: number, server: any) => {
  const task = await prisma.task.create({
    data: {
      name: `[${server.name || server.url}]: fullscan`,
      completed: false,
      inProgress: false,
      userId,
    },
  });

  q.push({ id: 'fullscan', dbId: task.id, server, type: 'genres' }).on(
    'finish',
    () => {
      q.push({
        id: 'fullscan',
        dbId: task.id,
        server,
        type: 'albumArtists',
      }).on('finish', () => {
        q.push({ id: 'fullscan', dbId: task.id, server, type: 'albums' }).on(
          'finish',
          () => {
            q.push({ id: 'fullscan', dbId: task.id, server, type: 'album' });
          }
        );
      });
    }
  );
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
