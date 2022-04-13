/* eslint-disable no-await-in-loop */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { clipboard, shell } from 'electron';
import { apiController } from '../api/controller';
import { notifyToast } from '../components/shared/toast';
import { useAppSelector } from '../redux/hooks';
import { Server } from '../types';

export const useBrowserDownload = () => {
  const { t } = useTranslation();
  const config = useAppSelector((state) => state.config);

  const handleDownload = useCallback(
    async (data, type: 'copy' | 'download', playlist?: boolean) => {
      const downloadUrls = [];

      if (config.serverType === Server.Jellyfin) {
        for (let i = 0; i < data.song.length; i += 1) {
          downloadUrls.push(
            await apiController({
              serverType: Server.Jellyfin,
              endpoint: 'getDownloadUrl',
              args: { id: data.song[i].id },
            })
          );
        }
      }

      if (config.serverType === Server.Subsonic) {
        if (playlist) {
          // This matches Navidrome's playlist GUID Id format
          if (data.id.includes('-')) {
            downloadUrls.push(
              await apiController({
                serverType: Server.Subsonic,
                endpoint: 'getDownloadUrl',
                args: { id: data.id },
              })
            );
          } else {
            for (let i = 0; i < data.song.length; i += 1) {
              downloadUrls.push(
                await apiController({
                  serverType: Server.Subsonic,
                  endpoint: 'getDownloadUrl',
                  args: { id: data.song[i].id },
                })
              );
            }
          }
        }
        // If not Navidrome (this assumes Airsonic), then we need to use a song's parent
        // to download. This is because Airsonic does not support downloading via album ids
        // that are provided by /getAlbum or /getAlbumList2
        else if (data.song[0]?.parent) {
          downloadUrls.push(
            await apiController({
              serverType: Server.Subsonic,
              endpoint: 'getDownloadUrl',
              args: { id: data.song[0].parent },
            })
          );
        } else {
          downloadUrls.push(
            await apiController({
              serverType: Server.Subsonic,
              endpoint: 'getDownloadUrl',
              args: { id: data.song[0].parent },
            })
          );
          notifyToast('info', t('Download links copied!'));
        }
      }

      if (downloadUrls.length === 0) {
        return notifyToast('warning', t('No parent album found'));
      }

      if (type === 'download') {
        return downloadUrls.forEach((url) => shell.openExternal(url));
      }

      clipboard.writeText(downloadUrls.join('\n'));
      return notifyToast('info', t('Download links copied!'));
    },
    [config.serverType, t]
  );

  return { handleDownload };
};
