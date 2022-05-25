// import Queue from 'better-queue';
// import { prisma } from '../../lib';
// import { Server, ServerFolder } from '../../types/types';
// import {
//   scanAlbumDetail,
//   importAlbumArtists,
//   scanAlbums,
//   scanGenres,
// } from './subsonic-tasks';

// const q = new Queue(
//   async (
//     task: {
//       dbId: number;
//       id: string;
//       server: Server;
//       serverFolder: ServerFolder;
//       type: 'genres' | 'albumArtists' | 'albums' | 'albumDetail';
//     },
//     cb: any
//   ) => {
//     await prisma.task.update({
//       data: { completed: false, inProgress: true },
//       where: { id: task.dbId },
//     });

//     if (task.type === 'genres') {
//       await scanGenres(task.server);
//     }

//     if (task.type === 'albumArtists') {
//       await importAlbumArtists(task.server, task.serverFolder);
//     }

//     if (task.type === 'albums') {
//       await scanAlbums(task.server, task.serverFolder);
//     }

//     if (task.type === 'albumDetail') {
//       await scanAlbumDetail(task.server, task.serverFolder, task.dbId);
//     }

//     const result = await cb(null, task);
//     return result;
//   },
//   {
//     batchSize: 1,
//     concurrent: 1,
//     filo: true,
//     maxTimeout: 60000,
//   }
// );

// q.on('task_finish', async (_taskId, result) => {
//   await prisma.task.update({
//     data: { completed: true, inProgress: false },
//     where: { id: Number(result.dbId) },
//   });
// });

// // const scannerTask = async (
// //   userId: number,
// //   server: Server,
// //   type: 'genres' | 'albumArtists' | 'albums' | 'album'
// // ) => {
// //   const task = await prisma.task.create({
// //     data: {
// //       name: `[${server.name || server.url}]: scan ${type}`,
// //       completed: false,
// //       inProgress: false,
// //       userId,
// //     },
// //   });

// //   q.push({ id: task.id, server, type });
// // };

// const fullScan = async (server: Server) => {
//   const task = await prisma.task.create({
//     data: {
//       completed: false,
//       inProgress: false,
//       name: `[${server.name || server.url}]: fullscan`,
//       serverFolderId: 1,
//     },
//   });

//   const args = {
//     dbId: task.id,
//     id: 'fullscan',
//     server,
//   };

//   if (server.serverFolder) {
//     server.serverFolder
//       .filter((folder) => folder.enabled)
//       .forEach((folder) => {
//         q.push({
//           ...args,
//           serverFolder: folder,
//           type: 'genres',
//         }).on('finish', () => {
//           q.push({
//             ...args,
//             serverFolder: folder,
//             type: 'albumArtists',
//           }).on('finish', () => {
//             q.push({
//               ...args,
//               serverFolder: folder,
//               type: 'albums',
//             }).on('finish', () => {
//               q.push({
//                 ...args,
//                 server,
//                 serverFolder: folder,
//                 type: 'albumDetail',
//               });
//             });
//           });
//         });
//       });
//   }
// };

// q.on('task_progress', (taskId, completed, total) => {
//   console.log('taskId', taskId);
//   console.log('completed', completed);
//   console.log('total', total);
// });

// export const subsonicScanner = {
//   fullScan,
// };
