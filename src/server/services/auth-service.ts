import bcrypt from 'bcryptjs';
import { prisma } from '../lib';
import { ApiSuccess } from '../utils';
import { ApiError } from '../utils/api-error';

const login = async (options: { username: string }) => {
  const { username } = options;
  const user = await prisma.user.findUnique({ where: { username } });

  return ApiSuccess.ok({ data: { ...user } });
};

const register = async (options: { password: string; username: string }) => {
  const { username, password } = options;
  const userExists = await prisma.user.findUnique({ where: { username } });

  if (userExists) {
    throw ApiError.conflict('The user already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      enabled: false,
      password: hashedPassword,
      username,
    },
  });

  return ApiSuccess.ok({ data: user });
};

export const authService = {
  login,
  register,
};
