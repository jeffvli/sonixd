import { useQuery } from 'react-query';
import { apiController } from '../api/controller';
import { ConfigPage } from '../redux/configSlice';
import { Server } from '../types';

const useGetLyrics = (config: ConfigPage, options: any) => {
  const { data }: any = useQuery(
    ['lyrics', options],
    () =>
      apiController({ serverType: config.serverType, endpoint: 'getLyrics', args: { ...options } }),
    { enabled: options.artist !== undefined && config.serverType === Server.Subsonic }
  );

  return { data };
};

export default useGetLyrics;
