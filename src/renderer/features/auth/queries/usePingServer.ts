import { useQuery } from 'react-query';
import { authApi, queryKeys } from 'renderer/api';

export const usePingServer = (server: string) => {
  return useQuery({
    enabled: !!server,
    queryFn: () => authApi.ping(server),
    queryKey: queryKeys.ping(server),
    retry: false,
  });
};
