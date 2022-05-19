import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '../lib';
import ApiError from '../utils/api-error';
import ApiSuccess from '../utils/api-success';

const login = async (options: { username: string }) => {
  const { username } = options;
  const user = await prisma.user.findUnique({ where: { username } });

  return ApiSuccess.ok({ data: { ...user } });
};

const register = async (options: { username: string; password: string }) => {
  const { username, password } = options;
  const registerSchema = z.object({
    username: z.string().min(4).max(26),
    password: z.string().min(6).max(255),
  });

  const validate = await registerSchema.safeParseAsync({
    username,
    password,
  });

  if (!validate.success) {
    throw ApiError.badRequest(
      'The username and password must meet the requirements.'
    );
  }

  const userExists = await prisma.user.findUnique({ where: { username } });

  if (userExists) {
    throw ApiError.conflict('The user already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      enabled: false,
    },
  });

  return ApiSuccess.ok({ data: user });
};

export const authService = {
  login,
  register,
};
