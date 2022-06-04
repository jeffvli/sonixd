import { useQuery } from 'react-query';
import { queryKeys } from 'renderer/api';
import { serversApi } from 'renderer/api/serversApi';
import { ExtractFnReturnType, QueryConfig } from 'renderer/lib';

type UseServersOptions = {
  config?: QueryConfig<QueryFnType>;
};

type QueryFnType = typeof serversApi.getServers;

export const useServers = ({ config }: UseServersOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryFn: () => serversApi.getServers(),
    queryKey: queryKeys.servers,
  });
};
