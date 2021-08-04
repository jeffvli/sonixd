import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PlayQueueTypes = [
  {
    id: string;
    album: string;
    albumId: string;
    artist: string;
    bitRate: number;
    contentType: string;
    coverArt: string;
    created: string;
    duration: string;
    genre: string;
    index: number;
    isDir: boolean;
    isVideo: boolean;
    parent: string;
    path: string;
    playCount: number;
    size: number;
    starred?: string;
    streamUrl: string;
    suffix: string;
    title: string;
    track: number;
    type: string;
    year: number;
  }
];

const initialState: PlayQueueTypes[] = [];

const playQueueSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    setPlayQueue: (state, action: PayloadAction<PlayQueueTypes>) => {
      action.payload.map((entry: any) => state.push(entry));
    },
    appendPlayQueue: (state, action: PayloadAction<PlayQueueTypes>) => {
      action.payload.map((entry: any) => state.push(entry));
    },
    clearPlayQueue: () => initialState,
  },
});

export const { setPlayQueue, clearPlayQueue } = playQueueSlice.actions;
export default playQueueSlice.reducer;
