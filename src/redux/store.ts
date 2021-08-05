import { configureStore } from '@reduxjs/toolkit';
import clickHandlerReducer from './clickHandlerSlice';
import playerReducer from './playerSlice';
import playQueueReducer, { PlayQueue } from './playQueueSlice';

export const store = configureStore<PlayQueue | any>({
  reducer: {
    clickHandler: clickHandlerReducer,
    player: playerReducer,
    playQueue: playQueueReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
