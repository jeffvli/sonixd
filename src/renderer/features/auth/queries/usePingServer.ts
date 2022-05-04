import { useQuery } from 'react-query';

import { authApi } from 'renderer/api';

import { authKeys } from './queryKeys';

const usePingServer = (server: string) => {
  return useQuery(authKeys.ping(server), () => authApi.ping({ server }), {
    enabled: !!server,
    retry: false,
  });
};

export default usePingServer;
