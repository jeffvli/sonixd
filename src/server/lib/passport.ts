import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy } from 'passport-local';

import { prisma } from './prisma';

passport.use(
  new Strategy(async (username: string, password: string, done: any) => {
    const user = await prisma.user.findUnique({ where: { username } });

    if (user === null || user === undefined) {
      return done(null, false);
    }

    if (!user.enabled) {
      return done(null, false, { message: 'The user is not enabled.' });
    }

    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    }

    return done(null, false, { message: 'Invalid credentials.' });
  })
);

passport.serializeUser((user: any, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  return done(
    null,
    await prisma.user.findUnique({
      where: {
        id,
      },
    })
  );
});
