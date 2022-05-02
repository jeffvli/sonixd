import bcrypt from 'bcryptjs';
import passport, { PassportStatic } from 'passport';

import orm from './prisma';

const LocalStrategy = require('passport-local');

export = (p: PassportStatic) => {
  p.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      const user = await orm.user.findUnique({ where: { username } });

      if (!user) {
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
};

passport.serializeUser((user: any, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  return done(
    null,
    await orm.user.findUnique({
      where: {
        id,
      },
    })
  );
});
