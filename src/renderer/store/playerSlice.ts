import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Play, PlayerRepeat, PlayerStatus, Song, Crossfade } from 'types';

import type { RootState } from './store';

export interface PlayerState {
  status: PlayerStatus;
  shuffle: boolean;
  repeat: PlayerRepeat;
  volume: number;
  muted: boolean;
  type: 'gapless' | 'crossfade';
  crossfadeType: Crossfade;
  crossfadeDuration: number;
  queue: {
    index: number;
    player: 1 | 2;
    default: Song[];
    shuffled: Song[];
    sorted: Song[];
  };
}

const initialState: PlayerState = {
  status: PlayerStatus.Paused,
  shuffle: false,
  repeat: PlayerRepeat.None,
  volume: 0,
  muted: false,
  type: 'gapless',
  crossfadeType: Crossfade.EqualPower,
  crossfadeDuration: 5,
  queue: {
    index: 0,
    player: 1,
    default: [],
    shuffled: [],
    sorted: [],
  },
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    queue: (state, action: PayloadAction<{ type: Play; data: Song[] }>) => {
      state.queue.default = action.payload.data;
    },

    play: (state) => {
      state.status = PlayerStatus.Playing;
    },

    pause: (state) => {
      state.status = PlayerStatus.Paused;
    },

    next: (state) => {
      state.queue.player = 1;
      state.queue.index += 1;
    },

    prev: (state) => {
      const newIndex = state.queue.index - 1 < 0 ? 0 : state.queue.index - 1;
      state.queue.player = 1;
      state.queue.index = newIndex;
    },

    autoIncrement: (state) => {
      state.queue.index += 1;
      state.queue.player = state.queue.player === 1 ? 2 : 1;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = (action.payload / 100) ** 2;
    },

    setType: (state, action: PayloadAction<'gapless' | 'crossfade'>) => {
      state.type = action.payload;
    },

    setCrossfadeDuration: (state, action: PayloadAction<number>) => {
      state.crossfadeDuration = action.payload;
    },

    toggleMute: (state) => {
      state.muted = !state.muted;
    },

    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },

    toggleRepeat: (state) => {
      if (state.repeat === PlayerRepeat.None) {
        state.repeat = PlayerRepeat.All;
      } else if (state.repeat === PlayerRepeat.All) {
        state.repeat = PlayerRepeat.One;
      } else {
        state.repeat = PlayerRepeat.None;
      }
    },
  },
});

export const {
  queue,
  play,
  pause,
  next,
  prev,
  autoIncrement,
  setVolume,
  setType,
  setCrossfadeDuration,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
} = playerSlice.actions;

export const selectPlayerStatus = (state: RootState) => {
  return state.player.status;
};

export const selectCurrentSong = (state: RootState) => {
  return state.player.queue.default[state.player.queue.index];
};

export const selectPlayer1Song = (state: RootState) => {
  const currentPlayer = state.player.queue.player;
  if (currentPlayer === 1) {
    return state.player.queue.default[state.player.queue.index];
  }

  return state.player.queue.default[state.player.queue.index + 1];
};

export const selectPlayer2Song = (state: RootState) => {
  const currentPlayer = state.player.queue.player;
  if (currentPlayer === 1) {
    return state.player.queue.default[state.player.queue.index + 1];
  }

  return state.player.queue.default[state.player.queue.index];
};

export const selectNextSong = (state: RootState) => {
  return state.player.queue.default[state.player.queue.index + 1];
};

export const selectCurrentQueue = (state: RootState) => {
  return state.player.queue.default;
};

export const selectCurrentPlayer = (state: RootState) => {
  return state.player.queue.player;
};

export const selectPlayerConfig = (state: RootState) => {
  return {
    muted: state.player.muted,
    volume: state.player.volume,
    shuffle: state.player.shuffle,
    repeat: state.player.repeat,
    type: state.player.type,
    crossfadeType: state.player.crossfadeType,
    crossfadeDuration: state.player.crossfadeDuration,
  };
};

export default playerSlice.reducer;
