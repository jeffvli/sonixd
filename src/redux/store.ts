import { AnyAction, configureStore, Dispatch, EnhancedStore, Middleware } from '@reduxjs/toolkit';
import { forwardToMain, replayActionRenderer } from 'electron-redux';
import playerReducer from './playerSlice';
import playQueueReducer, { PlayQueue } from './playQueueSlice';
import multiSelectReducer from './multiSelectSlice';
import miscReducer from './miscSlice';
import playlistReducer from './playlistSlice';
import folderReducer from './folderSlice';
import configReducer from './configSlice';
import favoriteReducer from './favoriteSlice';
import artistReducer from './artistSlice';
import viewReducer from './viewSlice';

export const store: EnhancedStore<
  any,
  AnyAction,
  [Middleware<Record<string, any>, any, Dispatch<AnyAction>>]
> = configureStore<PlayQueue | any>({
  reducer: {
    player: playerReducer,
    playQueue: playQueueReducer,
    multiSelect: multiSelectReducer,
    misc: miscReducer,
    playlist: playlistReducer,
    folder: folderReducer,
    config: configReducer,
    favorite: favoriteReducer,
    artist: artistReducer,
    view: viewReducer,
  },
  middleware: [forwardToMain],
});

replayActionRenderer(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
