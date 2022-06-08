/* eslint-disable @typescript-eslint/no-unused-vars */
import produce from 'immer';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { setLocalStorageSettings } from 'renderer/utils';
import {
  CrossfadeStyle,
  PlaybackStyle,
  PlaybackType,
  PlayerRepeat,
  PlayerStatus,
  Song,
} from 'types';

export interface PlayerState {
  current: {
    index: number;
    player: 1 | 2;
    status: PlayerStatus;
  };
  queue: {
    default: Song[];
    shuffled: Song[];
    sorted: Song[];
  };
  settings: {
    crossfadeDuration: number;
    crossfadeStyle: CrossfadeStyle;
    muted: boolean;
    repeat: PlayerRepeat;
    shuffle: boolean;
    style: PlaybackStyle;
    type: PlaybackType;
    volume: number;
  };
}

export interface PlayerData {
  current: {
    index: number;
    player: 1 | 2;

    status: PlayerStatus;
  };
  player1: Song;
  player2: Song;
  queue: {
    current: Song;
    next: Song;
    previous: Song;
  };
}

export interface PlayerSlice extends PlayerState {
  add: (songs: Song[]) => void;
  autoNext: () => void;
  getPlayerData: () => PlayerData;
  next: () => PlayerData;
  pause: () => void;
  play: () => void;
  prev: () => PlayerData;
  setSettings: (settings: Partial<PlayerState['settings']>) => void;
}

export const usePlayerStore = create<PlayerSlice>()(
  devtools((set, get) => ({
    add: (songs) => {
      set(
        produce((state) => {
          state.queue.default = songs;
        })
      );
    },
    autoNext: () => {
      set(
        produce((state) => {
          state.current.index += 1;
          state.current.player = state.current.player === 1 ? 2 : 1;
          state.current.time = 0;
        })
      );
    },
    current: {
      index: 0,
      player: 1,
      status: PlayerStatus.Paused,
      time: 0,
    },
    getPlayerData: () => {
      const queue = get().queue.default;
      const currentPlayer = get().current.player;

      const player1 =
        currentPlayer === 1
          ? queue[get().current.index]
          : queue[get().current.index + 1];

      const player2 =
        currentPlayer === 1
          ? queue[get().current.index + 1]
          : queue[get().current.index];

      return {
        current: {
          index: get().current.index,
          player: get().current.player,

          status: get().current.status,
        },
        player1,
        player2,
        queue: {
          current: queue[get().current.index],
          next: queue[get().current.index + 1],
          previous: queue[get().current.index - 1],
        },
      };
    },
    next: () => {
      set(
        produce((state) => {
          state.current.index += 1;
          state.current.player = 1;
        })
      );

      return get().getPlayerData();
    },
    pause: () => {
      set(
        produce((state) => {
          state.current.status = PlayerStatus.Paused;
        })
      );
    },
    play: () => {
      set(
        produce((state) => {
          state.current.status = PlayerStatus.Playing;
        })
      );
    },
    prev: () => {
      set(
        produce((state) => {
          state.current.index =
            state.current.index - 1 < 0 ? 0 : state.current.index - 1;
          state.current.player = 1;
        })
      );

      return get().getPlayerData();
    },
    queue: {
      default: [],
      shuffled: [],
      sorted: [],
    },
    setSettings: (settings) => {
      set(
        produce((state) => {
          state.settings = { ...get().settings, ...settings };
        })
      );

      setLocalStorageSettings('player', get().settings);
    },
    settings: {
      crossfadeDuration: 5,
      crossfadeStyle: CrossfadeStyle.EqualPower,
      muted: false,
      repeat: PlayerRepeat.None,
      shuffle: false,
      style: PlaybackStyle.Gapless,
      type: PlaybackType.Local,
      volume: 0.3,
    },
  }))
);
