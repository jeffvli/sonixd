import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { ButtonToolbar, ControlLabel, Form, Whisper } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DeleteButton,
  DownloadButton,
  EditButton,
  PlayAppendButton,
  PlayAppendNextButton,
  PlayButton,
  SaveButton,
  UndoButton,
} from '../shared/ToolbarButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import { clearSelected } from '../../redux/multiSelectSlice';
import {
  createRecoveryFile,
  errorMessages,
  formatDate,
  formatDateTime,
  formatDuration,
  getAlbumSize,
  getCurrentEntryList,
  getRecoveryPath,
  getUniqueRandomNumberArr,
  isCached,
  isFailedResponse,
} from '../../shared/utils';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import GenericPageHeader from '../layout/GenericPageHeader';
import { setStatus } from '../../redux/playerSlice';
import { notifyToast } from '../shared/toast';
import { addProcessingPlaylist, removeProcessingPlaylist } from '../../redux/miscSlice';
import { StyledButton, StyledCheckbox, StyledInput, StyledLink } from '../shared/styled';
import { removeFromPlaylist, setPlaylistData } from '../../redux/playlistSlice';
import { PageHeaderSubtitleDataLine } from '../layout/styled';
import CustomTooltip from '../shared/CustomTooltip';
import { apiController } from '../../api/controller';
import { Play, Server } from '../../types';
import Card from '../card/Card';
import CenterLoader from '../loader/CenterLoader';
import useListClickHandler from '../../hooks/useListClickHandler';
import Popup from '../shared/Popup';
import usePlayQueueHandler from '../../hooks/usePlayQueueHandler';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';
import { useBrowserDownload } from '../../hooks/useBrowserDownload';

interface PlaylistParams {
  id: string;
}

const PlaylistView = ({ ...rest }) => {
  const { t } = useTranslation();
  const [isModified, setIsModified] = useState(false);
  const dispatch = useAppDispatch();
  const playlist = useAppSelector((state) => state.playlist);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const history = useHistory();
  const queryClient = useQueryClient();
  const editTriggerRef = useRef<any>();
  const { id } = useParams<PlaylistParams>();
  const playlistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(['playlist', playlistId], () =>
    apiController({
      serverType: config.serverType,
      endpoint: 'getPlaylist',
      args: { id: playlistId },
    })
  );

  const [customPlaylistImage, setCustomPlaylistImage] = useState<string | string[]>(
    'img/placeholder.png'
  );
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [recoveryPath, setRecoveryPath] = useState('');
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const filteredData = useSearchQuery(misc.searchQuery, playlist.entry, [
    'title',
    'artist',
    'album',
    'year',
    'genre',
    'path',
  ]);

  useHotkeys(
    'del',
    () => {
      const selectedType = multiSelect.selected[0].type;
      if (selectedType === 'music') {
        dispatch(removeFromPlaylist({ selectedEntries: multiSelect.selected }));
      }
    },
    [multiSelect.selected]
  );

  useEffect(() => {
    const recoveryFilePath = path.join(getRecoveryPath(), `playlist_${data?.id}.json`);

    setRecoveryPath(recoveryFilePath);
    setNeedsRecovery(fs.existsSync(recoveryFilePath));
  }, [data?.id]);

  useEffect(() => {
    // Set the local playlist data on any changes
    dispatch(setPlaylistData(data?.song || []));
    setEditName(data?.title || '');
    setEditDescription(data?.comment || '');
    setEditPublic(data?.public || false);
  }, [data, dispatch]);

  useEffect(() => {
    if (!_.isEqual(data?.song, playlist[getCurrentEntryList(playlist)])) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [data?.song, playlist]);

  const { handleRowClick, handleRowDoubleClick, handleDragEnd } = useListClickHandler({
    doubleClick: (rowData: any) => {
      dispatch(
        setPlayQueueByRowClick({
          entries: rowData.tableData,
          currentIndex: rowData.rowIndex,
          currentSongId: rowData.id,
          uniqueSongId: rowData.uniqueId,
          filters: config.playback.filters,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    },
    dnd: 'playlist',
  });

  const { handlePlayQueueAdd } = usePlayQueueHandler();
  const { handleDownload } = useBrowserDownload();

  const handleSave = async (recovery: boolean) => {
    dispatch(clearSelected());
    dispatch(addProcessingPlaylist(data.id));
    if (config.serverType === Server.Subsonic) {
      try {
        let res;
        const playlistData = recovery
          ? JSON.parse(fs.readFileSync(recoveryPath, { encoding: 'utf-8' }))
          : playlist[getCurrentEntryList(playlist)];

        // Smaller playlists can use the safe /createPlaylist method of saving
        if (playlistData.length <= 400 && !recovery) {
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongs',
            args: { id: data.id, entry: playlistData },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
          } else {
            notifyToast('success', t('Saved playlist'));
            await queryClient.refetchQueries(['playlist'], {
              active: true,
            });
          }
        } else {
          // For larger playlists, we'll need to first clear out the playlist and then re-populate it
          // Tested on Airsonic instances, /createPlaylist fails with around ~350+ songId params
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'clearPlaylist',
            args: { id: data.id },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
            return dispatch(removeProcessingPlaylist(data.id));
          }

          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: data.id, entry: playlistData },
          });

          if (isFailedResponse(res)) {
            res.forEach((response: any) => {
              if (isFailedResponse(response)) {
                notifyToast('error', errorMessages(response)[0]);
              }
            });

            // If there are any failures (network, etc.), then we'll need a way to recover the playlist.
            // Write the localPlaylistData to a file so we can re-run the save command.
            createRecoveryFile(data.id, 'playlist', playlistData);
            setNeedsRecovery(true);
            return dispatch(removeProcessingPlaylist(data.id));
          }

          if (recovery) {
            // If the recovery succeeds, we can remove the recovery file
            fs.unlinkSync(recoveryPath);
            setNeedsRecovery(false);
            notifyToast('success', t('Recovered playlist from backup'));
          } else {
            notifyToast('success', t('Saved playlist'));
          }

          await queryClient.refetchQueries(['playlist'], {
            active: true,
          });
        }
      } catch (err) {
        notifyToast('error', t('Errored while saving playlist'));
        const playlistData = recovery
          ? JSON.parse(fs.readFileSync(recoveryPath, { encoding: 'utf-8' }))
          : playlist[getCurrentEntryList(playlist)];

        createRecoveryFile(data.id, 'playlist', playlistData);
        setNeedsRecovery(true);
        dispatch(removeProcessingPlaylist(data.id));
      }
    }

    if (config.serverType === Server.Jellyfin) {
      const { id: newPlaylistId } = await apiController({
        serverType: config.serverType,
        endpoint: 'updatePlaylistSongs',
        args: { name: data.title, entry: playlist[getCurrentEntryList(playlist)] },
      });

      if (newPlaylistId) {
        await apiController({
          serverType: config.serverType,
          endpoint: 'deletePlaylist',
          args: { id: data.id },
        });

        await apiController({
          serverType: config.serverType,
          endpoint: 'updatePlaylist',
          args: {
            id: newPlaylistId,
            name: data.title,
            dateCreated: data.created,
            comment: data.comment,
            genres: data.genres,
          },
        });

        history.replace(`/playlist/${newPlaylistId}`);
        notifyToast('success', t('Saved playlist'));
      } else {
        notifyToast('error', t('Error saving playlist'));
      }
    }

    dispatch(setPlaylistData(playlist[getCurrentEntryList(playlist)]));
    return dispatch(removeProcessingPlaylist(data.id));
  };

  const handleEdit = async () => {
    setIsSubmittingEdit(true);

    if (config.serverType === Server.Subsonic) {
      try {
        const res = await apiController({
          serverType: config.serverType,
          endpoint: 'updatePlaylist',
          args:
            config.serverType === Server.Subsonic
              ? {
                  id: data.id,
                  name: editName,
                  comment: editDescription,
                  genres: data.genres,
                  isPublic: editPublic,
                }
              : null,
        });

        if (isFailedResponse(res)) {
          notifyToast('error', errorMessages(res)[0]);
        } else {
          queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
            return { ...oldData, title: editName, comment: editDescription, public: editPublic };
          });
        }
      } catch {
        notifyToast('error', t('Error saving playlist'));
      } finally {
        setIsSubmittingEdit(false);
      }
    }

    if (config.serverType === Server.Jellyfin) {
      try {
        apiController({
          serverType: config.serverType,
          endpoint: 'updatePlaylist',
          args: {
            id: data.id,
            name: editName,
            comment: editDescription,
            genres: data.genres,
            isPublic: editPublic,
          },
        });
      } catch {
        notifyToast('error', t('Error saving playlist'));
      } finally {
        setIsSubmittingEdit(false);
      }

      notifyToast('success', t('Saved playlist'));
      queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
        return { ...oldData, title: editName, comment: editDescription, public: editPublic };
      });
    }

    editTriggerRef.current.close();
  };

  const handleDelete = async () => {
    try {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'deletePlaylist',
        args: { id: data.id },
      });

      if (isFailedResponse(res)) {
        notifyToast('error', res.error.message);
      } else {
        history.push('/playlist');
      }
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  useEffect(() => {
    if (data?.image.match('placeholder')) {
      const uniqueAlbums: any = _.uniqBy(data?.song, 'albumId');

      if (uniqueAlbums.length === 0) {
        setCustomPlaylistImage('img/placeholder.png');
      } // If less than 4 images, we'll just set a single random image
      else if (uniqueAlbums.length > 0 && uniqueAlbums.length < 4) {
        setCustomPlaylistImage(uniqueAlbums[_.random(0, uniqueAlbums.length - 1)]?.image);
      } else if (uniqueAlbums.length >= 4) {
        const randomUniqueNumbers = getUniqueRandomNumberArr(4, uniqueAlbums.length);
        const randomAlbumImages = randomUniqueNumbers.map((num) => uniqueAlbums[num].image);

        setCustomPlaylistImage(randomAlbumImages);
      }
    }
  }, [data?.image, data?.song]);

  if (isLoading) {
    return <CenterLoader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          image={
            <Card
              title={t('None')}
              subtitle=""
              coverArt={
                data?.image.match('placeholder')
                  ? customPlaylistImage
                  : isCached(`${misc.imageCachePath}playlist_${playlistId}.jpg`)
                  ? `${misc.imageCachePath}playlist_${playlistId}.jpg`
                  : data.image
              }
              size={185}
              hasHoverButtons
              noInfoPanel
              noModalButton
              details={data}
              playClick={{ type: 'playlist', id: data.id }}
              url={`/playlist/${data.id}`}
            />
          }
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'playlist',
            id: data.id,
          }}
          imageHeight={185}
          title={data.title}
          subtitle={
            <div>
              <PageHeaderSubtitleDataLine $top>
                <StyledLink onClick={() => history.push('/playlist')}>
                  <strong>{t('PLAYLIST')}</strong>
                </StyledLink>{' '}
                • {data.songCount} songs, {formatDuration(data.duration)} •{' '}
                {data.public ? t('Public') : t('Private')}
              </PageHeaderSubtitleDataLine>
              <PageHeaderSubtitleDataLine>
                {data.owner && t('By {{dataOwner}} • ', { dataOwner: data.owner })}
                {data.created && t('Created {{val, datetime}}', { val: formatDate(data.created) })}
                {data.changed &&
                  t(' • Modified {{val, datetime}}', { val: formatDateTime(data.changed) })}
              </PageHeaderSubtitleDataLine>
              {data.comment && (
                <CustomTooltip text={data.comment} placement="bottomStart" disabled={!data.comment}>
                  <PageHeaderSubtitleDataLine
                    style={{
                      minHeight: '1.2rem',
                      maxHeight: '1.2rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <span>{data.comment ? data.comment : ''}</span>
                  </PageHeaderSubtitleDataLine>
                </CustomTooltip>
              )}
              <div style={{ marginTop: '10px' }}>
                <ButtonToolbar>
                  <PlayButton
                    appearance="primary"
                    size="lg"
                    $circle
                    onClick={() =>
                      handlePlayQueueAdd({
                        byData: playlist[getCurrentEntryList(playlist)],
                        play: Play.Play,
                      })
                    }
                    disabled={playlist.entry?.length < 1}
                  />
                  <PlayAppendNextButton
                    appearance="subtle"
                    size="md"
                    onClick={() =>
                      handlePlayQueueAdd({
                        byData: playlist[getCurrentEntryList(playlist)],
                        play: Play.Next,
                      })
                    }
                    disabled={playlist.entry?.length < 1}
                  />
                  <PlayAppendButton
                    appearance="subtle"
                    size="md"
                    onClick={() =>
                      handlePlayQueueAdd({
                        byData: playlist[getCurrentEntryList(playlist)],
                        play: Play.Later,
                      })
                    }
                    disabled={playlist.entry?.length < 1}
                  />
                  <SaveButton
                    size="md"
                    appearance="subtle"
                    text={
                      needsRecovery
                        ? t('Recover playlist')
                        : t(
                            'Save (WARNING: Closing the application while saving may result in data loss)'
                          )
                    }
                    color={needsRecovery ? 'red' : undefined}
                    disabled={
                      (!needsRecovery && !isModified) ||
                      misc.isProcessingPlaylist.includes(data?.id)
                    }
                    loading={misc.isProcessingPlaylist.includes(data?.id)}
                    onClick={() => handleSave(needsRecovery)}
                  />
                  <UndoButton
                    size="md"
                    appearance="subtle"
                    color={needsRecovery ? 'red' : undefined}
                    disabled={
                      needsRecovery || !isModified || misc.isProcessingPlaylist.includes(data?.id)
                    }
                    onClick={() => dispatch(setPlaylistData(data?.song))}
                  />
                  <Whisper
                    ref={editTriggerRef}
                    enterable
                    placement="auto"
                    trigger="click"
                    speaker={
                      <Popup>
                        <Form>
                          <ControlLabel>{t('Name')}</ControlLabel>
                          <StyledInput
                            placeholder={t('Name')}
                            value={editName}
                            onChange={(e: string) => setEditName(e)}
                          />
                          <ControlLabel>{t('Description')}</ControlLabel>
                          <StyledInput
                            placeholder={t('Description')}
                            value={editDescription}
                            onChange={(e: string) => setEditDescription(e)}
                          />
                          <StyledCheckbox
                            defaultChecked={editPublic}
                            value={editPublic}
                            onChange={(_v: any, e: boolean) => setEditPublic(e)}
                            disabled={config.serverType === Server.Jellyfin}
                          >
                            {t('Public')}
                          </StyledCheckbox>
                          <StyledButton
                            size="md"
                            type="submit"
                            block
                            loading={isSubmittingEdit}
                            disabled={isSubmittingEdit}
                            onClick={handleEdit}
                            appearance="primary"
                          >
                            {t('Save')}
                          </StyledButton>
                        </Form>
                      </Popup>
                    }
                  >
                    <EditButton
                      size="md"
                      appearance="subtle"
                      disabled={misc.isProcessingPlaylist.includes(data?.id)}
                    />
                  </Whisper>
                  <Whisper
                    trigger="hover"
                    placement="bottom"
                    delay={250}
                    enterable
                    preventOverflow
                    speaker={
                      <Popup>
                        <ButtonToolbar>
                          <StyledButton onClick={() => handleDownload(data, 'download', true)}>
                            {t('Download')}
                          </StyledButton>
                          <StyledButton onClick={() => handleDownload(data, 'copy', true)}>
                            {t('Copy to clipboard')}
                          </StyledButton>
                        </ButtonToolbar>
                      </Popup>
                    }
                  >
                    <DownloadButton
                      size="lg"
                      appearance="subtle"
                      downloadSize={getAlbumSize(data.song)}
                    />
                  </Whisper>
                  <Whisper
                    enterable
                    placement="auto"
                    trigger="click"
                    speaker={
                      <Popup>
                        <p>{t('Are you sure you want to delete this playlist?')}</p>
                        <StyledButton onClick={handleDelete} appearance="link">
                          {t('Yes')}
                        </StyledButton>
                      </Popup>
                    }
                  >
                    <DeleteButton
                      size="md"
                      appearance="subtle"
                      disabled={misc.isProcessingPlaylist.includes(data?.id)}
                    />
                  </Whisper>
                </ButtonToolbar>
              </div>
            </div>
          }
        />
      }
    >
      <ListViewType
        data={misc.searchQuery !== '' ? filteredData : playlist[getCurrentEntryList(playlist)]}
        tableColumns={config.lookAndFeel.listView.music.columns}
        handleRowClick={handleRowClick}
        handleRowDoubleClick={handleRowDoubleClick}
        handleDragEnd={handleDragEnd}
        virtualized
        rowHeight={config.lookAndFeel.listView.music.rowHeight}
        fontSize={config.lookAndFeel.listView.music.fontSize}
        cacheImages={{
          enabled: settings.getSync('cacheImages'),
          cacheType: 'album',
          cacheIdProperty: 'albumId',
        }}
        listType="music"
        playlist
        dnd
        isModal={rest.isModal}
        disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
        handleFavorite={(rowData: any) =>
          handleFavorite(rowData, { queryKey: ['playlist', playlistId] })
        }
        handleRating={(rowData: any, rating: number) => handleRating(rowData, { rating })}
        loading={isLoading}
      />
    </GenericPage>
  );
};

export default PlaylistView;
