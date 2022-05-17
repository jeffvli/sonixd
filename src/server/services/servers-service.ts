import { prisma } from '../lib';
import { subsonicScanner } from '../tasks';
import ApiError from '../utils/api-error';
import ApiSuccess from '../utils/api-success';

const get = async () => {
  const servers = await prisma.server.findMany({
    include: { User: { select: { username: true } } },
  });

  return ApiSuccess.ok({ servers });
};

const create = async (options: {
  name: string;
  url: string;
  alternateUrl: string;
  username: string;
  token: string;
  serverType: string;
  userId: number;
}) => {
  const server = await prisma.server.create({
    data: options,
  });

  return ApiSuccess.ok({ ...server });
};

const scan = async (options: { id: number; userId: number }) => {
  const { id, userId } = options;
  const server = await prisma.server.findUnique({ where: { id } });

  if (!server) {
    throw ApiError.notFound('Server does not exist.');
  }

  subsonicScanner.fullScan(userId, server);

  return ApiSuccess.ok({});
};

export const serversService = {
  get,
  create,
  scan,
};
