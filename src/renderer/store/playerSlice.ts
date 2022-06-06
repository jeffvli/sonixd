import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Play, PlayerRepeat, PlayerStatus, Song, Crossfade } from 'types';
import type { RootState } from './store';

export interface PlayerState {
  crossfadeDuration: number;
  crossfadeType: Crossfade;
  muted: boolean;
  queue: {
    default: Song[];
    index: number;
    player: 1 | 2;
    shuffled: Song[];
    sorted: Song[];
  };
  repeat: PlayerRepeat;
  shuffle: boolean;
  status: PlayerStatus;
  type: 'gapless' | 'crossfade';
  volume: number;
}

const initialState: PlayerState = {
  crossfadeDuration: 5,
  crossfadeType: Crossfade.EqualPower,
  muted: false,
  queue: {
    default: [],
    index: 0,
    player: 1,
    shuffled: [],
    sorted: [],
  },
  repeat: PlayerRepeat.None,
  shuffle: false,
  status: PlayerStatus.Paused,
  type: 'gapless',
  volume: 0.3,
};

export const playerSlice = createSlice({
  initialState,
  name: 'player',
  reducers: {
    autoIncrement: (state: PlayerState) => {
      state.queue.index += 1;
      state.queue.player = state.queue.player === 1 ? 2 : 1;
    },

    next: (state: PlayerState) => {
      state.queue.player = 1;
      state.queue.index += 1;
    },

    pause: (state: PlayerState) => {
      state.status = PlayerStatus.Paused;
    },

    play: (state: PlayerState) => {
      state.status = PlayerStatus.Playing;
    },

    prev: (state: PlayerState) => {
      const newIndex = state.queue.index - 1 < 0 ? 0 : state.queue.index - 1;
      state.queue.player = 1;
      state.queue.index = newIndex;
    },

    queue: (
      state: PlayerState,
      action: PayloadAction<{ data: Song[]; type: Play }>
    ) => {
      state.queue.default = action.payload.data;
    },

    setCrossfadeDuration: (
      state: PlayerState,
      action: PayloadAction<number>
    ) => {
      state.crossfadeDuration = action.payload;
    },

    setType: (
      state: PlayerState,
      action: PayloadAction<'gapless' | 'crossfade'>
    ) => {
      state.type = action.payload;
    },

    setVolume: (state: PlayerState, action: PayloadAction<number>) => {
      state.volume = (action.payload / 100) ** 2;
    },

    toggleMute: (state: PlayerState) => {
      state.muted = !state.muted;
    },

    toggleRepeat: (state: PlayerState) => {
      if (state.repeat === PlayerRepeat.None) {
        state.repeat = PlayerRepeat.All;
      } else if (state.repeat === PlayerRepeat.All) {
        state.repeat = PlayerRepeat.One;
      } else {
        state.repeat = PlayerRepeat.None;
      }
    },

    toggleShuffle: (state: PlayerState) => {
      state.shuffle = !state.shuffle;
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

export const selectPreviousSong = (state: RootState) => {
  return state.player.queue.default[state.player.queue.index - 1];
};

export const selectNextSong = (state: RootState) => {
  return state.player.queue.default[state.player.queue.index + 1];
};

export const selectNextSongLocal = (state: RootState) => {
  return state.player.queue.default[state.player.queue.index + 2];
};

export const selectCurrentQueue = (state: RootState) => {
  return state.player.queue.default;
};

export const selectCurrentPlayer = (state: RootState) => {
  return state.player.queue.player;
};

export const selectPlayerConfig = (state: RootState) => {
  return {
    crossfadeDuration: state.player.crossfadeDuration,
    crossfadeType: state.player.crossfadeType,
    muted: state.player.muted,
    repeat: state.player.repeat,
    shuffle: state.player.shuffle,
    type: state.player.type,
    volume: state.player.volume,
  };
};

export const playerReducer = playerSlice.reducer;
