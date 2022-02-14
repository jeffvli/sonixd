import _ from 'lodash';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { apiController } from '../api/controller';
import { setStar } from '../redux/playQueueSlice';
import { setPlaylistStar } from '../redux/playlistSlice';

const useFavorite = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);
  const queryClient = useQueryClient();

  const handleFavorite = useCallback(
    async (rowData, options?: { queryKey?: any; custom?: any }) => {
      const favorite = !rowData.starred;

      await apiController({
        serverType: config.serverType,
        endpoint: favorite ? 'star' : 'unstar',
        args: { id: rowData.id, type: rowData.type },
      });

      if (options?.queryKey) {
        queryClient.setQueryData(options.queryKey, (oldData: any) => {
          if (oldData?.data) {
            const starredIndices = _.keys(_.pickBy(oldData.data, { id: rowData.id }));
            starredIndices.forEach((index) => {
              oldData.data[index].starred = favorite ? Date.now() : undefined;
            });

            return oldData;
          }

          if (oldData?.album) {
            const starredIndices = _.keys(_.pickBy(oldData.album, { id: rowData.id }));
            starredIndices.forEach((index) => {
              oldData.album[index].starred = favorite ? Date.now() : undefined;
            });

            return oldData;
          }

          if (oldData?.song) {
            const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
            starredIndices.forEach((index) => {
              oldData.song[index].starred = favorite ? Date.now() : undefined;
            });

            return oldData;
          }

          const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
          starredIndices.forEach((index) => {
            oldData[index].starred = favorite ? Date.now() : undefined;
          });

          return oldData;
        });
      }

      if (options?.custom) {
        options.custom();
      }

      dispatch(setStar({ id: [rowData.id], type: favorite ? 'star' : 'unstar' }));
      dispatch(setPlaylistStar({ id: [rowData.id], type: favorite ? 'star' : 'unstar' }));
    },
    [config.serverType, dispatch, queryClient]
  );

  return { handleFavorite };
};

export default useFavorite;
