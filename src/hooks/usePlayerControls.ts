import { useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { deflate, inflate } from 'zlib';
import { join } from 'path';
import { access, constants, readFile, writeFile } from 'fs';
import { useAppDispatch } from '../redux/hooks';
import {
  decrementCurrentIndex,
  fixPlayer2Index,
  incrementCurrentIndex,
  PlayQueueSaveState,
  restoreState,
  setVolume,
  toggleDisplayQueue,
  toggleRepeat,
  toggleShuffle,
} from '../redux/playQueueSlice';
import { setStatus } from '../redux/playerSlice';
import { apiController } from '../api/controller';
import { Server } from '../types';
import { settings } from '../components/shared/setDefaultSettings';

const usePlayerControls = (
  config: any,
  player: any,
  playQueue: any,
  currentEntryList: any,
  playersRef: any,
  isDraggingVolume: any,
  setIsDraggingVolume: any,
  setLocalVolume: any,
  setCurrentTime: any
) => {
  const dispatch = useAppDispatch();

  const handleNextTrack = useCallback(() => {
    if (playQueue[currentEntryList].length > 0) {
      // If on the last track of the queue without repeat set as all, ignore
      if (
        playQueue.repeat !== 'all' &&
        playQueue.currentIndex === playQueue[currentEntryList].length - 1
      ) {
        return;
      }

      dispatch(incrementCurrentIndex('usingHotkey'));
      dispatch(setStatus('PLAYING'));
    }
  }, [currentEntryList, dispatch, playQueue]);

  const handlePrevTrack = useCallback(() => {
    if (playQueue[currentEntryList].length > 0) {
      const { currentPlayer } = playQueue;
      const currentSeek =
        currentPlayer === 1
          ? playersRef.current.player1.audioEl.current.currentTime
          : playersRef.current.player2.audioEl.current.currentTime;

      if (
        currentSeek < 5 &&
        !(
          (playQueue.repeat === 'none' || playQueue.repeat === 'one') &&
          playQueue.currentIndex === 0
        )
      ) {
        dispatch(decrementCurrentIndex('usingHotkey'));
        dispatch(fixPlayer2Index());
      } else if (currentPlayer === 1) {
        playersRef.current.player1.audioEl.current.currentTime = 0;
        playersRef.current.player1.audioEl.current.volume = playQueue.volume ** 2;

        // Reset the alt player if reset during fade
        playersRef.current.player2.audioEl.current.currentTime = 0;
        playersRef.current.player2.audioEl.current.volume = 0;
        playersRef.current.player2.audioEl.current.pause();

        ipcRenderer.send('seeked', 0);

        if (config.serverType === Server.Jellyfin && playQueue.scrobble) {
          apiController({
            serverType: config.serverType,
            endpoint: 'scrobble',
            args: {
              id: playQueue[currentEntryList][playQueue.player1.index]?.id,
              submission: false,
              position: 0,
              event: 'timeupdate',
            },
          });
        }
      } else {
        playersRef.current.player2.audioEl.current.currentTime = 0;
        playersRef.current.player2.audioEl.current.volume = playQueue.volume ** 2;

        // Reset the alt player if reset during fade
        playersRef.current.player1.audioEl.current.currentTime = 0;
        playersRef.current.player1.audioEl.current.volume = 0;
        playersRef.current.player1.audioEl.current.pause();

        ipcRenderer.send('seeked', 0);

        if (config.serverType === Server.Jellyfin && playQueue.scrobble) {
          apiController({
            serverType: config.serverType,
            endpoint: 'scrobble',
            args: {
              id: playQueue[currentEntryList][playQueue.player2.index]?.id,
              submission: false,
              position: 0,
              event: 'timeupdate',
            },
          });
        }
      }
    }

    dispatch(setStatus('PLAYING'));
  }, [config.serverType, currentEntryList, dispatch, playQueue, playersRef]);

  const handlePlayPause = useCallback(() => {
    if (playQueue[currentEntryList].length > 0) {
      if (player.status === 'PAUSED') {
        dispatch(setStatus('PLAYING'));

        ipcRenderer.send('playpause', {
          status: 'PLAYING',
          position:
            playQueue.currentPlayer === 1
              ? Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
              : Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000),
        });
      } else {
        dispatch(setStatus('PAUSED'));
        ipcRenderer.send('playpause', {
          status: 'PAUSED',
          position:
            playQueue.currentPlayer === 1
              ? Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
              : Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000),
        });
      }
    }
  }, [currentEntryList, dispatch, playQueue, player.status, playersRef]);

  const handlePlay = useCallback(() => {
    ipcRenderer.send('playpause', {
      status: 'PLAYING',
      position:
        playQueue.currentPlayer === 1
          ? Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
          : Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000),
    });

    dispatch(setStatus('PLAYING'));
  }, [dispatch, playQueue.currentPlayer, playersRef]);

  const handlePause = useCallback(() => {
    ipcRenderer.send('playpause', {
      status: 'PAUSED',
      position:
        playQueue.currentPlayer === 1
          ? Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
          : Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000),
    });

    dispatch(setStatus('PAUSED'));
  }, [dispatch, playQueue.currentPlayer, playersRef]);

  const handleStop = useCallback(() => {
    playersRef.current.player2.audioEl.current.pause();
    playersRef.current.player2.audioEl.current.currentTime = 0;
    playersRef.current.player1.audioEl.current.pause();
    playersRef.current.player1.audioEl.current.currentTime = 0;
    setCurrentTime(0);

    ipcRenderer.send('playpause', {
      status: 'PAUSED',
      position: 0,
    });

    setTimeout(() => {
      dispatch(setStatus('PAUSED'));
    }, 250);
  }, [dispatch, playersRef, setCurrentTime]);

  const handleSeekBackward = useCallback(() => {
    const seekBackwardInterval = Number(settings.get('seekBackwardInterval'));
    if (playQueue[currentEntryList].length > 0) {
      if (playQueue.isFading) {
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player2.audioEl.current.pause();
          playersRef.current.player2.audioEl.current.currentTime = 0;
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
        }
      }

      if (playQueue.currentPlayer === 1) {
        const newTime =
          playersRef.current.player1.audioEl.current.currentTime - seekBackwardInterval;
        playersRef.current.player1.audioEl.current.currentTime = newTime;
        setCurrentTime(newTime);
        ipcRenderer.send('seeked', newTime * 1000000);
      } else {
        const newTime =
          playersRef.current.player2.audioEl.current.currentTime - seekBackwardInterval;
        playersRef.current.player2.audioEl.current.currentTime = newTime;
        setCurrentTime(newTime);
        ipcRenderer.send('seeked', newTime * 1000000);
      }
    }
  }, [currentEntryList, playQueue, playersRef, setCurrentTime]);

  const handleSeekForward = useCallback(() => {
    if (playQueue[currentEntryList].length > 0) {
      const seekForwardInterval = Number(settings.get('seekForwardInterval'));

      if (playQueue.isFading) {
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player2.audioEl.current.pause();
          playersRef.current.player2.audioEl.current.currentTime = 0;
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
        }
      }

      if (playQueue.currentPlayer === 1) {
        const check = playersRef.current.player1.audioEl.current.currentTime + seekForwardInterval;
        const songDuration = playersRef.current.player1.audioEl.current.duration;
        const newTime = check > songDuration ? songDuration - 1 : check;
        playersRef.current.player1.audioEl.current.currentTime = newTime;
        setCurrentTime(newTime);
        ipcRenderer.send('seeked', newTime * 1000000);
      } else {
        const check = playersRef.current.player2.audioEl.current.currentTime + seekForwardInterval;
        const songDuration = playersRef.current.player2.audioEl.current.duration;
        const newTime = check > songDuration ? songDuration - 1 : check;
        playersRef.current.player2.audioEl.current.currentTime = newTime;
        setCurrentTime(newTime);
        ipcRenderer.send('seeked', newTime * 1000000);
      }
    }
  }, [currentEntryList, playQueue, playersRef, setCurrentTime]);

  const handleSeekSlider = useCallback(
    (e: number | any) => {
      ipcRenderer.send('seeked', e * 1000000);

      // If trying to seek back while fading to the next track, we need to
      // pause and reset the next track so that they don't begin overlapping
      if (playQueue.isFading) {
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player2.audioEl.current.pause();
          playersRef.current.player2.audioEl.current.currentTime = 0;
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
        }
      }

      if (playQueue.currentPlayer === 1) {
        playersRef.current.player1.audioEl.current.currentTime = e;
      } else {
        playersRef.current.player2.audioEl.current.currentTime = e;
      }

      setCurrentTime(e);
    },
    [playQueue.currentPlayer, playQueue.isFading, playersRef, setCurrentTime]
  );

  const handleVolumeSlider = (e: number) => {
    if (!isDraggingVolume) {
      setIsDraggingVolume(true);
    }
    const vol = Number((e / 100).toFixed(2));
    setLocalVolume(vol);
    ipcRenderer.send('volume', vol);
  };

  const handleVolumeKey = useCallback(
    (e: any) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        const vol = Number((playQueue.volume + 0.05 > 1 ? 1 : playQueue.volume + 0.05).toFixed(2));
        setLocalVolume(vol);
        dispatch(setVolume(vol));
        ipcRenderer.send('volume', vol);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        const vol = Number((playQueue.volume - 0.05 < 0 ? 0 : playQueue.volume - 0.05).toFixed(2));
        setLocalVolume(vol);
        dispatch(setVolume(vol));
        ipcRenderer.send('volume', vol);
      }
    },
    [dispatch, playQueue.volume, setLocalVolume]
  );

  const handleVolumeWheel = useCallback(
    (e: any) => {
      if (e.deltaY > 0) {
        if (!isDraggingVolume) {
          setIsDraggingVolume(true);
        }
        let vol = Number((playQueue.volume - 0.01).toFixed(2));
        vol = vol < 0 ? 0 : vol;
        setLocalVolume(vol);
        dispatch(setVolume(vol));
        ipcRenderer.send('volume', vol);
      } else {
        let vol = Number((playQueue.volume + 0.01).toFixed(2));
        vol = vol > 1 ? 1 : vol;
        setLocalVolume(vol);
        dispatch(setVolume(vol));
        ipcRenderer.send('volume', vol);
      }
    },
    [dispatch, isDraggingVolume, playQueue.volume, setIsDraggingVolume, setLocalVolume]
  );

  const handleRepeat = useCallback(() => {
    const currentRepeat = settings.get('repeat');
    const newRepeat = currentRepeat === 'none' ? 'all' : currentRepeat === 'all' ? 'one' : 'none';
    dispatch(toggleRepeat());
    settings.set('repeat', newRepeat);
  }, [dispatch]);

  const handleShuffle = useCallback(() => {
    dispatch(toggleShuffle());
    settings.set('shuffle', !settings.get('shuffle'));
  }, [dispatch]);

  const handleDisplayQueue = () => {
    dispatch(toggleDisplayQueue());
  };

  const handleSaveQueue = useCallback(
    (path: string) => {
      const queueLocation = join(path, 'queue');

      const data: PlayQueueSaveState = {
        entry: playQueue.entry,
        shuffledEntry: playQueue.shuffledEntry,

        // current song
        current: playQueue.current,
        currentIndex: playQueue.currentIndex,
        currentSongId: playQueue.currentSongId,
        currentSongUniqueId: playQueue.currentSongUniqueId,

        // players
        player1: playQueue.player1,
        player2: playQueue.player2,
        currentPlayer: playQueue.currentPlayer,
      };

      const dataString = JSON.stringify(data);

      // This whole compression task is actually quite quick
      // While we could add a notify toast, it would only show for a moment
      // before compression would finish.
      // Compression level 1 seems to give sufficient performance, as it was able to save
      // around 10k songs by using ~3.5 MB while still being quite fast.
      deflate(
        dataString,
        {
          level: 1,
        },
        (error, deflated) => {
          if (error) {
            ipcRenderer.send('saved-state');
          } else {
            writeFile(queueLocation, deflated, (writeError) => {
              if (writeError) console.error(writeError);
              ipcRenderer.send('saved-state');
            });
          }
        }
      );
    },
    [playQueue]
  );

  const handleRestoreQueue = useCallback(
    (path: string) => {
      const queueLocation = join(path, 'queue');
      access(queueLocation, constants.F_OK, (accessError) => {
        // If the file doesn't exist or we can't access it, just don't try
        if (accessError) {
          console.error(accessError);
          return;
        }

        readFile(queueLocation, (error, buffer) => {
          if (error) {
            console.error(error);
            return;
          }

          inflate(buffer, (decompressError, data) => {
            if (decompressError) {
              console.error(decompressError);
            } else {
              dispatch(restoreState(JSON.parse(data.toString())));
            }
          });
        });
      });
    },
    [dispatch]
  );

  useEffect(() => {
    ipcRenderer.on('player-next-track', () => {
      handleNextTrack();
    });

    ipcRenderer.on('player-prev-track', () => {
      handlePrevTrack();
    });

    ipcRenderer.on('player-play-pause', () => {
      handlePlayPause();
    });

    ipcRenderer.on('player-play', () => {
      handlePlay();
    });

    ipcRenderer.on('player-pause', () => {
      handlePause();
    });

    ipcRenderer.on('player-stop', () => {
      handleStop();
    });

    ipcRenderer.on('player-shuffle', () => {
      handleShuffle();
    });

    ipcRenderer.on('player-repeat', () => {
      handleRepeat();
    });

    ipcRenderer.on('save-queue-state', (_event, path: string) => {
      handleSaveQueue(path);
    });

    ipcRenderer.on('restore-queue-state', (_event, path: string) => {
      handleRestoreQueue(path);
    });

    return () => {
      ipcRenderer.removeAllListeners('player-next-track');
      ipcRenderer.removeAllListeners('player-prev-track');
      ipcRenderer.removeAllListeners('player-play-pause');
      ipcRenderer.removeAllListeners('player-play');
      ipcRenderer.removeAllListeners('player-pause');
      ipcRenderer.removeAllListeners('player-stop');
      ipcRenderer.removeAllListeners('player-shuffle');
      ipcRenderer.removeAllListeners('player-repeat');
      ipcRenderer.removeAllListeners('save-queue-state');
      ipcRenderer.removeAllListeners('restore-queue-state');
    };
  }, [
    handleNextTrack,
    handlePause,
    handlePlay,
    handlePlayPause,
    handlePrevTrack,
    handleRepeat,
    handleShuffle,
    handleStop,
    handleSaveQueue,
    handleRestoreQueue,
  ]);

  useEffect(() => {
    ipcRenderer.on('current-position-request', (_event, arg) => {
      if (arg.currentPlayer === 1) {
        ipcRenderer.send(
          'seeked',
          Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
        );
      } else {
        ipcRenderer.send(
          'seeked',
          Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000)
        );
      }
    });

    ipcRenderer.on('position-request', (_event, arg) => {
      const newPosition = Math.floor(arg.position / 1000000);

      if (arg.currentPlayer === 1) {
        playersRef.current.player1.audioEl.current.currentTime = newPosition;
      } else {
        playersRef.current.player2.audioEl.current.currentTime = newPosition;
      }

      ipcRenderer.send('seeked', arg.position);
    });

    ipcRenderer.on('seek-request', (_event, arg) => {
      let newPosition;
      if (arg.currentPlayer === 1) {
        newPosition = playersRef.current.player1.audioEl.current.currentTime + arg.offset / 1000000;
        setCurrentTime(newPosition);
        ipcRenderer.send('seeked', newPosition * 1000000);
      } else {
        newPosition = playersRef.current.player2.audioEl.current.currentTime + arg.offset / 1000000;
        setCurrentTime(newPosition);
        ipcRenderer.send('seeked', newPosition * 1000000);
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('current-position-request');
      ipcRenderer.removeAllListeners('position-request');
      ipcRenderer.removeAllListeners('seek-request');
    };
  }, [playersRef, setCurrentTime]);

  return {
    handleNextTrack,
    handlePrevTrack,
    handlePlayPause,
    handleSeekBackward,
    handleSeekForward,
    handleSeekSlider,
    handleVolumeKey,
    handleVolumeSlider,
    handleVolumeWheel,
    handleRepeat,
    handleShuffle,
    handleDisplayQueue,
    handleStop,
  };
};

export default usePlayerControls;
