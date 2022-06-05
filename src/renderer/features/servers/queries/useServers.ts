import md5 from 'md5';
import { useQuery } from 'react-query';
import { queryKeys, serversApi } from 'renderer/api';
import { ServerFolderResponse } from 'renderer/api/types';

export interface ServerFolderAuth {
  id: number;
  locked: boolean;
  serverId: number;
  token: string;
  type: string;
  url: string;
  userId: string;
  username: string;
}

export const useServers = () => {
  return useQuery({
    onSuccess: (servers) => {
      const { serverUrl } = JSON.parse(
        localStorage.getItem('authentication') || '{}'
      );
      const storedServersKey = `servers_${md5(serverUrl)}`;
      const serversFromLocalStorage = localStorage.getItem(storedServersKey);

      // If a custom account/token is set for a server, use that instead of the default one
      if (serversFromLocalStorage) {
        const existingServers = JSON.parse(serversFromLocalStorage);

        // The 'locked' property determines whether or not to skip updating the server auth
        const skipped = existingServers.filter(
          (server: ServerFolderAuth) => server.locked
        );

        const store = servers.flatMap((server) =>
          server.serverFolder?.map((serverFolder: ServerFolderResponse) => {
            if (skipped.includes(serverFolder.id)) {
              return existingServers.find(
                (s: ServerFolderAuth) => s.id === serverFolder.id
              );
            }

            return {
              id: serverFolder.id,
              locked: false,
              serverId: server.id,
              token: server.token,
              type: server.serverType,
              url: server.url,
              userId: server.remoteUserId,
              username: server.username,
            };
          })
        );

        return localStorage.setItem(storedServersKey, JSON.stringify(store));
      }

      const store = servers.flatMap((server) =>
        server.serverFolder?.map((serverFolder: ServerFolderResponse) => ({
          id: serverFolder.id,
          locked: false,
          serverId: server.id,
          token: server.token,
          type: server.serverType,
          url: server.url,
          userId: server.remoteUserId,
          username: server.username,
        }))
      );

      return localStorage.setItem(storedServersKey, JSON.stringify(store));
    },
    queryFn: () => serversApi.getServers(),
    queryKey: queryKeys.servers,
  });
};
