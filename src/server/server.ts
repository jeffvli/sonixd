import path from 'path';

import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';

import 'express-async-errors';

import orm from './lib/prisma';
import { errorHandler } from './middleware';
import routes from './routes';

const PORT = 9321;

const app = express();

const staticPath = path.join(__dirname, '../sonixd-client/');

app.use(express.static(staticPath));
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(orm, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(
  cors({
    origin: [`http://localhost:4343`, `${process.env.APP_BASE_URL}`],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(passport.initialize());
app.use(passport.session());
require('./lib/passport')(passport);

app.get('/', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.use(routes);
app.use(errorHandler);

app.listen(9321, () => console.log(`Listening on port ${PORT}`));
