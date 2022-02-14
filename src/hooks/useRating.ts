import _ from 'lodash';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { apiController } from '../api/controller';
import { setRate } from '../redux/playQueueSlice';
import { setPlaylistRate } from '../redux/playlistSlice';

export const useRating = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);

  const handleRating = useCallback(
    async (rowData, options: { queryKey?: any; rating: number; custom?: any }) => {
      await apiController({
        serverType: config.serverType,
        endpoint: 'setRating',
        args: { ids: [rowData.id], rating: options.rating },
      });

      if (options?.queryKey) {
        queryClient.setQueryData(options.queryKey, (oldData: any) => {
          if (oldData?.data) {
            const ratedIndices = _.keys(_.pickBy(oldData.data, { id: rowData.id }));
            ratedIndices.forEach((index) => {
              oldData.data[index].userRating = options.rating;
            });

            return oldData;
          }

          if (oldData?.song) {
            const ratedIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
            ratedIndices.forEach((index) => {
              oldData.song[index].userRating = options.rating;
            });

            return oldData;
          }

          const ratedIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
          ratedIndices.forEach((index) => {
            oldData[index].userRating = options.rating;
          });

          return oldData;
        });
      }

      if (options?.custom) {
        options.custom();
      }

      await queryClient.refetchQueries(['starred'], { active: true });
      await queryClient.refetchQueries(['searchpage'], { active: true });

      dispatch(setRate({ id: [rowData.id], rating: options.rating }));
      dispatch(setPlaylistRate({ id: [rowData.id], rating: options.rating }));
    },
    [config.serverType, dispatch, queryClient]
  );

  return { handleRating };
};
