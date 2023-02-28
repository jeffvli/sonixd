/* eslint-disable consistent-return */
import { useEffect, useState } from 'react';
import RPC, { Presence } from 'discord-rpc';
import { notifyToast } from '../components/shared/toast';
import { useAppSelector } from '../redux/hooks';
import { Artist, Server } from '../types';

const useDiscordRpc = ({ playersRef }: any) => {
  const player = useAppSelector((state) => state.player);
  const playQueue = useAppSelector((state) => state.playQueue);
  const config = useAppSelector((state) => state.config);
  const [discordRpc, setDiscordRpc] = useState<any>();

  useEffect(() => {
    if (config.external.discord.enabled) {
      const client = new RPC.Client({ transport: 'ipc' });

      if (discordRpc?.client !== config.external.discord.clientId) {
        client.login({ clientId: config.external.discord.clientId }).catch((err: any) => {
          notifyToast('error', `${err}`);
        });

        client.once('connected', () => {
          notifyToast('success', 'Discord RPC is connected');
        });

        setDiscordRpc(client);
      }
    }
  }, [config.external.discord.clientId, config.external.discord.enabled, discordRpc?.client]);

  useEffect(() => {
    if (!config.external.discord.enabled) {
      try {
        discordRpc?.destroy();
      } catch (err) {
        notifyToast('error', `${err}`);
      }
    }
  }, [config.external.discord.enabled, discordRpc]);

  useEffect(() => {
    if (config.external.discord.enabled) {
      const setActivity = async () => {
        if (!discordRpc) {
          return;
        }

        const currentPlayer =
          playQueue.currentPlayer === 1
            ? playersRef.current?.player1.audioEl.current
            : playersRef.current?.player2.audioEl.current;

        const now = Date.now();
        const start = Math.round(now - currentPlayer.currentTime * 1000) || 0;
        const end = Math.round(start + playQueue?.current?.duration * 1000) || 0;

        const artists = playQueue.current?.artist.map((artist: Artist) => artist.title).join(', ');

        const activity: Presence = {
          details: playQueue.current?.title.padEnd(2, ' ') || 'Not playing',
          state: artists && `By ${artists}`,
          largeImageKey: undefined,
          largeImageText: playQueue.current?.album || 'Unknown album',
          smallImageKey: undefined,
          smallImageText: player.status,
          instance: false,
        };

        if (player.status === 'PLAYING') {
          activity.startTimestamp = start;
          activity.endTimestamp = end;
          activity.smallImageKey = 'playing';
        } else {
          activity.smallImageKey = 'paused';
        }

        if (config.serverType === Server.Jellyfin && config.external.discord.serverImage) {
          activity.largeImageKey = playQueue.current?.image;
        }

        // Fall back to default icon if not set
        if (!activity.largeImageKey) {
          activity.largeImageKey = 'icon';
        }

        discordRpc.setActivity(activity);
      };

      // Activity can only be set every 15 seconds
      const interval = setInterval(() => {
        setActivity();
      }, 15e3);

      return () => clearInterval(interval);
    }
    return () => {};
  }, [
    config.external.discord.enabled,
    config.external.discord.serverImage,
    config.serverType,
    discordRpc,
    playQueue,
    playQueue.currentPlayer,
    player.status,
    playersRef,
  ]);
};

export default useDiscordRpc;
