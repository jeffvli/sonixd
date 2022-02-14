import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { getPlayedSongsNotification, filterPlayQueue } from '../shared/utils';
import { notifyToast } from '../components/shared/toast';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setStatus } from '../redux/playerSlice';
import {
  appendPlayQueue,
  clearPlayQueue,
  fixPlayer2Index,
  setPlayQueue,
} from '../redux/playQueueSlice';
import { APIEndpoints, Item, Play, Song } from '../types';
import { apiController } from '../api/controller';

const usePlayQueueHandler = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);
  const queryClient = useQueryClient();

  const dispatchSongsToQueue = useCallback(
    (entries: Song[], play: Play) => {
      const filteredSongs = filterPlayQueue(config.playback.filters, entries);

      if (play === Play.Play) {
        if (filteredSongs.entries.length > 0) {
          dispatch(setPlayQueue({ entries: filteredSongs.entries }));
          dispatch(setStatus('PLAYING'));
          dispatch(fixPlayer2Index());
        } else {
          dispatch(clearPlayQueue());
          dispatch(setStatus('PAUSED'));
        }
      }

      if (play === Play.Next || play === Play.Later) {
        if (filteredSongs.entries.length > 0) {
          dispatch(appendPlayQueue({ entries: filteredSongs.entries, type: play }));
          dispatch(fixPlayer2Index());
        }
      }

      notifyToast(
        'info',
        getPlayedSongsNotification({
          ...filteredSongs.count,
          type: play === Play.Play ? 'play' : 'add',
        })
      );
    },
    [config.playback.filters, dispatch]
  );

  const handlePlayQueueAdd = async (options: {
    byData?: Song[];
    byItemType?: { item: Item; id: string; endpoint?: APIEndpoints };
    play: Play;
    musicFolder?: string;
  }) => {
    if (options.byData) {
      dispatchSongsToQueue(options.byData, options.play);
    }

    if (options.byItemType) {
      const getEndpoint = (item: Item) => {
        switch (item) {
          case Item.Album:
            return 'getAlbum';
          case Item.Artist:
            return 'getArtistSongs';
          case Item.Playlist:
            return 'getPlaylist';
          default:
            return 'getAlbum';
        }
      };

      const data = await apiController({
        serverType: config.serverType,
        endpoint: options.byItemType.endpoint || getEndpoint(options.byItemType.item),
        args: { id: options.byItemType.id, musicFolder: options.musicFolder },
      });

      if (options.byItemType.item === Item.Album) {
        queryClient.setQueryData(['album', options.byItemType.id], data);
      } else if (options.byItemType.item === Item.Artist) {
        queryClient.setQueryData(['artistSongs', options.byItemType.id], data);
      } else if (options.byItemType.item === Item.Playlist) {
        queryClient.setQueryData(['playlist', options.byItemType.id], data);
      }

      if (data?.song) {
        dispatchSongsToQueue(data.song, options.play);
      } else {
        dispatchSongsToQueue(data, options.play);
      }
    }
  };

  return { handlePlayQueueAdd };
};

export default usePlayQueueHandler;
