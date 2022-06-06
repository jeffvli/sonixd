import { Dispatch, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import isElectron from 'is-electron';
import { playerApi, socket } from 'renderer/api/playerApi';
import { WebSettings } from 'renderer/features/settings';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';
import {
  next,
  pause,
  play,
  prev,
  selectCurrentSong,
  selectNextSong,
  selectNextSongLocal,
  selectPreviousSong,
  setVolume,
} from 'renderer/store/playerSlice';
import { PlayerStatus, Song } from '../../../../types';

export const useMainAudioControls = (args: {
  currentPlayer: 1 | 2;
  currentTime: number;
  playerStatus: PlayerStatus;
  playersRef: any;
  queue: Song[];
  setCurrentTime: Dispatch<number>;
  setDisableNext: Dispatch<boolean>;
  setDisablePrev: Dispatch<boolean>;
}) => {
  const [settings] = useLocalStorage<WebSettings>({ key: 'settings' });
  const {
    playersRef,
    playerStatus,
    queue,
    currentTime,
    currentPlayer,
    setCurrentTime,
    setDisableNext,
    setDisablePrev,
  } = args;

  const dispatch = useAppDispatch();
  const player1Ref = playersRef?.current?.player1;
  const player2Ref = playersRef?.current?.player2;
  const currentPlayerRef = currentPlayer === 1 ? player1Ref : player2Ref;
  const nextPlayerRef = currentPlayer === 1 ? player2Ref : player1Ref;
  const previousSong = useAppSelector(selectPreviousSong);
  const currentSong = useAppSelector(selectCurrentSong);
  const nextSong = useAppSelector(selectNextSong);
  const nextSongLocal = useAppSelector(selectNextSongLocal);

  useEffect(() => {
    if (isElectron() && settings.player === 'local') {
      socket.on('queue_player1', () => {
        console.log('SET PLAYER 1');
        socket.emit('queue_player1', nextSongLocal?.streamUrl);
        dispatch(next());
        setCurrentTime(0);
      });

      return () => {
        socket.off('queue_player1');
      };
    }

    return undefined;
  }, [dispatch, nextSongLocal, setCurrentTime, settings.player]);
  useEffect(() => {
    if (isElectron() && settings.player === 'local') {
      socket.on('queue_player2', () => {
        console.log('SET PLAYER 2');
        socket.emit('queue_player2', nextSongLocal?.streamUrl);
        dispatch(next());
        setCurrentTime(0);
      });

      return () => {
        socket.off('queue_player2');
      };
    }

    return undefined;
  }, [dispatch, nextSongLocal, setCurrentTime, settings.player]);

  const resetPlayers = useCallback(() => {
    player1Ref.getInternalPlayer().currentTime = 0;
    player2Ref.getInternalPlayer().currentTime = 0;
    player1Ref.getInternalPlayer().pause();
    player2Ref.getInternalPlayer().pause();
  }, [player1Ref, player2Ref]);

  const resetNextPlayer = useCallback(() => {
    currentPlayerRef.getInternalPlayer().volume = 0.1;
    nextPlayerRef.getInternalPlayer().currentTime = 0;
    nextPlayerRef.getInternalPlayer().pause();
  }, [currentPlayerRef, nextPlayerRef]);

  const stopPlayback = useCallback(() => {
    player1Ref.getInternalPlayer().pause();
    player2Ref.getInternalPlayer().pause();
    resetPlayers();
  }, [player1Ref, player2Ref, resetPlayers]);

  const handlePlay = useCallback(() => {
    if (settings.player === 'local') {
      playerApi.play();
    } else {
      currentPlayerRef.getInternalPlayer().play();
    }
    dispatch(play());
  }, [currentPlayerRef, dispatch, settings.player]);

  const handlePause = useCallback(() => {
    if (settings.player === 'local') {
      playerApi.pause();
    }

    dispatch(pause());
  }, [dispatch, settings.player]);

  const handleStop = useCallback(() => {
    if (settings.player === 'local') {
      playerApi.stop();
    } else {
      stopPlayback();
    }

    dispatch(pause());
    setCurrentTime(0);
  }, [dispatch, setCurrentTime, settings.player, stopPlayback]);

  const handleNextTrack = useCallback(() => {
    if (settings.player === 'local') {
      setDisableNext(true);
      playerApi.next(nextSong, nextSongLocal);
      setCurrentTime(0);
      setTimeout(() => setDisableNext(false), 400);
    } else {
      resetPlayers();
    }
    dispatch(next());
  }, [
    dispatch,
    nextSong,
    nextSongLocal,
    resetPlayers,
    setCurrentTime,
    setDisableNext,
    settings.player,
  ]);

  const handlePrevTrack = useCallback(() => {
    if (settings.player === 'local') {
      setDisablePrev(true);
      playerApi.previous(previousSong, currentSong);
      setCurrentTime(0);
      setTimeout(() => setDisablePrev(false), 400);
    } else {
      resetPlayers();
    }
    dispatch(prev());
  }, [
    currentSong,
    dispatch,
    previousSong,
    resetPlayers,
    setCurrentTime,
    setDisablePrev,
    settings.player,
  ]);

  const handlePlayPause = useCallback(() => {
    if (queue) {
      if (playerStatus === PlayerStatus.Paused) {
        return handlePlay();
      }

      return handlePause();
    }

    return null;
  }, [handlePause, handlePlay, playerStatus, queue]);

  const handleSkipBackward = useCallback(() => {
    const skipBackwardSec = 5;
    const newTime = currentPlayerRef.getCurrentTime() - skipBackwardSec;

    resetNextPlayer();
    setCurrentTime(newTime);
    currentPlayerRef.seekTo(newTime);
  }, [currentPlayerRef, resetNextPlayer, setCurrentTime]);

  const handleSkipForward = useCallback(() => {
    const skipForwardSec = 5;
    const checkNewTime = currentPlayerRef.getCurrentTime() + skipForwardSec;

    const songDuration = currentPlayerRef.player.player.duration;

    const newTime =
      checkNewTime >= songDuration ? songDuration - 1 : checkNewTime;

    resetNextPlayer();
    setCurrentTime(newTime);
    currentPlayerRef.seekTo(newTime);
  }, [currentPlayerRef, resetNextPlayer, setCurrentTime]);

  const handleSeekSlider = useCallback(
    (e: number | any) => {
      setCurrentTime(e);

      if (settings.player === 'local') {
        playerApi.seek(e);
      } else {
        currentPlayerRef.seekTo(e);
      }
    },
    [currentPlayerRef, setCurrentTime, settings.player]
  );

  const handleVolumeSlider = useCallback(
    (e: number | any) => {
      dispatch(setVolume(e));
      console.log('currentTime', currentTime);
      console.log('volume', e / 100);
      playerApi.volume(currentTime, e);
    },
    [currentTime, dispatch]
  );

  // useEffect(() => {
  //   ipcRenderer.on('player-next-track', () => {
  //     handleNextTrack();
  //   });

  //   ipcRenderer.on('player-prev-track', () => {
  //     handlePrevTrack();
  //   });

  //   ipcRenderer.on('player-play-pause', () => {
  //     handlePlayPause();
  //   });

  //   ipcRenderer.on('player-play', () => {
  //     handlePlay();
  //   });

  //   ipcRenderer.on('player-pause', () => {
  //     handlePause();
  //   });

  //   ipcRenderer.on('player-stop', () => {
  //     handleStop();
  //   });

  //   ipcRenderer.on('player-shuffle', () => {
  //     handleShuffle();
  //   });

  //   ipcRenderer.on('player-repeat', () => {
  //     handleRepeat();
  //   });

  //   ipcRenderer.on('save-queue-state', (_event, path: string) => {
  //     handleSaveQueue(path);
  //   });

  //   ipcRenderer.on('restore-queue-state', (_event, path: string) => {
  //     handleRestoreQueue(path);
  //   });

  //   return () => {
  //     ipcRenderer.removeAllListeners('player-next-track');
  //     ipcRenderer.removeAllListeners('player-prev-track');
  //     ipcRenderer.removeAllListeners('player-play-pause');
  //     ipcRenderer.removeAllListeners('player-play');
  //     ipcRenderer.removeAllListeners('player-pause');
  //     ipcRenderer.removeAllListeners('player-stop');
  //     ipcRenderer.removeAllListeners('player-shuffle');
  //     ipcRenderer.removeAllListeners('player-repeat');
  //     ipcRenderer.removeAllListeners('save-queue-state');
  //     ipcRenderer.removeAllListeners('restore-queue-state');
  //   };
  // }, [
  //   handleNextTrack,
  //   handlePause,
  //   handlePlay,
  //   handlePlayPause,
  //   handlePrevTrack,
  //   handleRepeat,
  //   handleShuffle,
  //   handleStop,
  //   handleSaveQueue,
  //   handleRestoreQueue,
  // ]);

  // useEffect(() => {
  //   ipcRenderer.on('current-position-request', (_event, arg) => {
  //     if (arg.currentPlayer === 1) {
  //       ipcRenderer.send(
  //         'seeked',
  //         Math.floor(
  //           playersRef.current.player1.audioEl.current.currentTime * 1000000
  //         )
  //       );
  //     } else {
  //       ipcRenderer.send(
  //         'seeked',
  //         Math.floor(
  //           playersRef.current.player2.audioEl.current.currentTime * 1000000
  //         )
  //       );
  //     }
  //   });

  //   ipcRenderer.on('position-request', (_event, arg) => {
  //     const newPosition = Math.floor(arg.position / 1000000);

  //     if (arg.currentPlayer === 1) {
  //       playersRef.current.player1.audioEl.current.currentTime = newPosition;
  //     } else {
  //       playersRef.current.player2.audioEl.current.currentTime = newPosition;
  //     }

  //     ipcRenderer.send('seeked', arg.position);
  //   });

  //   ipcRenderer.on('seek-request', (_event, arg) => {
  //     let newPosition;
  //     if (arg.currentPlayer === 1) {
  //       newPosition =
  //         playersRef.current.player1.audioEl.current.currentTime +
  //         arg.offset / 1000000;
  //       setCurrentTime(newPosition);
  //       ipcRenderer.send('seeked', newPosition * 1000000);
  //     } else {
  //       newPosition =
  //         playersRef.current.player2.audioEl.current.currentTime +
  //         arg.offset / 1000000;
  //       setCurrentTime(newPosition);
  //       ipcRenderer.send('seeked', newPosition * 1000000);
  //     }
  //   });

  //   return () => {
  //     ipcRenderer.removeAllListeners('current-position-request');
  //     ipcRenderer.removeAllListeners('position-request');
  //     ipcRenderer.removeAllListeners('seek-request');
  //   };
  // }, [playersRef, setCurrentTime]);

  return {
    handleNextTrack,
    handlePlayPause,
    handlePrevTrack,
    handleSeekSlider,
    handleSkipBackward,
    handleSkipForward,
    handleStop,
    handleVolumeSlider,
  };
};
