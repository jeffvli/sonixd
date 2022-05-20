import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({ errorFormat: 'minimal' });
export const exclude = <T, Key extends keyof T>(
  resultSet: T,
  ...keys: Key[]
): Omit<T, Key> => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    delete resultSet[key];
  }
  return resultSet;
};
