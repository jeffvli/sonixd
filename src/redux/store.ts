import { configureStore } from '@reduxjs/toolkit';
import { forwardToMain, replayActionRenderer } from 'electron-redux';
import playerReducer from './playerSlice';
import playQueueReducer, { PlayQueue } from './playQueueSlice';
import multiSelectReducer from './multiSelectSlice';
import miscReducer from './miscSlice';

export const store = configureStore<PlayQueue | any>({
  reducer: {
    player: playerReducer,
    playQueue: playQueueReducer,
    multiSelect: multiSelectReducer,
    misc: miscReducer,
  },
  middleware: [forwardToMain],
});

replayActionRenderer(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
