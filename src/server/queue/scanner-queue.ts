import Queue from 'better-queue';
import { prisma } from '../lib';
import { Task } from '../types/types';

interface QueueTask {
  fn: any;
  id: string;
  task: Task;
}

interface QueueResult {
  message?: string;
  task: Task;
}

export const q: Queue = new Queue(
  async (task: QueueTask, cb: any) => {
    const result = await task.fn();
    return cb(null, result);
  },
  {
    afterProcessDelay: 1000,
    cancelIfRunning: true,
    concurrent: 1,
    filo: false,
    maxRetries: 5,
    maxTimeout: 600000,
    retryDelay: 2000,
  }
);

q.on('task_finish', async (_taskId, result: QueueResult) => {
  await prisma.task.update({
    data: { completed: true, inProgress: false, message: result.message },
    where: { id: Number(result.task.id) },
  });
});

q.on('empty', () => {
  console.log('queue empty');
});

q.on('task_failed', () => {
  console.log('failed');
});

q.on('drain', () => {
  console.log('drained');
});
