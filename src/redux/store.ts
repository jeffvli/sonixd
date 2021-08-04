import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import nowPlayingReducer from './nowPlayingSlice';
import clickHandlerReducer from './clickHandlerSlice';
import playerReducer from './playerSlice';
import playQueueReducer from './playQueueSlice';

export const store = configureStore({
  reducer: {
    nowPlaying: nowPlayingReducer,
    clickHandler: clickHandlerReducer,
    player: playerReducer,
    playQueue: playQueueReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
