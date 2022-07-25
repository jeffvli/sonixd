import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import { ipcRenderer } from 'electron';
import settings from 'electron-settings';
import ReactAudioPlayer from 'react-audio-player';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  incrementPlayerIndex,
  setCurrentPlayer,
  setIsFading,
  setAutoIncremented,
  fixPlayer2Index,
  setCurrentIndex,
  setFadeData,
  setPlayerSrc,
  getNextPlayerIndex,
} from '../../redux/playQueueSlice';
import cacheSong from '../shared/cacheSong';
import { isCached, isLinux } from '../../shared/utils';
import { apiController } from '../../api/controller';
import { Artist, Server } from '../../types';
import { setStatus } from '../../redux/playerSlice';

const gaplessListenHandler = (
  currentPlayerRef: any,
  nextPlayerRef: any,
  playQueue: any,
  pollingInterval: number,
  shouldScrobble: boolean,
  scrobbled: boolean,
  setScrobbled: any,
  serverType: Server,
  duration: number
) => {
  const currentSeek = currentPlayerRef.current?.audioEl.current?.currentTime || 0;

  // Add a bit of leeway for the second track to start since the
  // seek value doesn't always reach the duration
  const durationPadding = pollingInterval <= 10 ? 0.12 : pollingInterval <= 20 ? 0.13 : 0.15;
  if (currentSeek + durationPadding >= duration) {
    if (playQueue.repeat === 'none' && playQueue.currentIndex === playQueue.entry.length - 1) {
      return;
    }

    nextPlayerRef.current.audioEl.current.volume = playQueue.volume ** 2;
    nextPlayerRef.current.audioEl.current.play();
  }

  // Conditions for scrobbling gapless track
  // 1. Scrobble enabled in settings
  // 2. Not already scrobbled
  // 3. Track reached past 4 minutes or past the 90% mark
  // 4. Not in the last 2 seconds of the track (gapless player starts second track before first ends)
  // Step 4 sets the scrobbled value to false again which would trigger a second scrobble
  if (
    shouldScrobble &&
    !scrobbled &&
    (currentSeek >= 240 || currentSeek >= duration * 0.9) &&
    currentSeek <= duration - 2
  ) {
    setScrobbled(true);
    apiController({
      serverType,
      endpoint: 'scrobble',
      args: {
        id: playQueue.currentSongId,
        albumId: playQueue.current.albumId,
        submission: true,
        position: serverType === Server.Jellyfin ? currentSeek * 1e7 : undefined,
      },
    });
  }
};

const listenHandler = (
  currentPlayerRef: any,
  nextPlayerRef: any,
  playQueue: any,
  currentEntryList: any,
  dispatch: any,
  player: number,
  fadeDuration: number,
  fadeType: string,
  volumeFade: boolean,
  debug: boolean,
  shouldScrobble: boolean,
  scrobbled: boolean,
  setScrobbled: any,
  serverType: Server,
  duration: number
) => {
  // Jellyfin only returns the duration in the last ~2 seconds of the song so we need to pass the
  // duration into the handler instead of fetching it here
  const currentSeek = currentPlayerRef.current?.audioEl.current?.currentTime || 0;
  const fadeAtTime = duration - fadeDuration;

  // Fade only if repeat is 'all' or if not on the last track
  if (
    playQueue[`player${player}`].index + 1 < playQueue[currentEntryList].length ||
    playQueue.repeat === 'all' ||
    playQueue.repeat === 'one'
  ) {
    // Detect to start fading when seek is greater than the fade time
    if (currentSeek >= fadeAtTime) {
      nextPlayerRef.current.audioEl.current.play();
      dispatch(setIsFading(true));

      if (volumeFade) {
        const timeLeft = duration - currentSeek;
        let currentPlayerVolumeCalculation;
        let nextPlayerVolumeCalculation;
        let percentageOfFadeLeft;
        let n;
        switch (fadeType) {
          case 'equalPower':
            // https://dsp.stackexchange.com/a/14755
            percentageOfFadeLeft = (timeLeft / fadeDuration) * 2;
            currentPlayerVolumeCalculation =
              Math.sqrt(0.5 * percentageOfFadeLeft) * playQueue.volume;
            nextPlayerVolumeCalculation =
              Math.sqrt(0.5 * (2 - percentageOfFadeLeft)) * playQueue.volume;
            break;
          case 'linear':
            currentPlayerVolumeCalculation = (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
          case 'dipped':
            // https://math.stackexchange.com/a/4622
            percentageOfFadeLeft = timeLeft / fadeDuration;
            currentPlayerVolumeCalculation = percentageOfFadeLeft ** 2 * playQueue.volume;
            nextPlayerVolumeCalculation = (percentageOfFadeLeft - 1) ** 2 * playQueue.volume;
            break;
          case fadeType.match(/constantPower.*/)?.input:
            // https://math.stackexchange.com/a/26159
            n =
              fadeType === 'constantPower'
                ? 0
                : fadeType === 'constantPowerSlowFade'
                ? 1
                : fadeType === 'constantPowerSlowCut'
                ? 3
                : 10;

            percentageOfFadeLeft = timeLeft / fadeDuration;
            currentPlayerVolumeCalculation =
              Math.cos((Math.PI / 4) * ((2 * percentageOfFadeLeft - 1) ** (2 * n + 1) - 1)) *
              playQueue.volume;
            nextPlayerVolumeCalculation =
              Math.cos((Math.PI / 4) * ((2 * percentageOfFadeLeft - 1) ** (2 * n + 1) + 1)) *
              playQueue.volume;
            break;

          default:
            currentPlayerVolumeCalculation = (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
        }

        const currentPlayerVolume =
          currentPlayerVolumeCalculation >= 0 ? currentPlayerVolumeCalculation : 0;

        const nextPlayerVolume =
          nextPlayerVolumeCalculation <= playQueue.volume
            ? nextPlayerVolumeCalculation
            : playQueue.volume;

        if (player === 1) {
          currentPlayerRef.current.audioEl.current.volume = currentPlayerVolume ** 2;
          nextPlayerRef.current.audioEl.current.volume = nextPlayerVolume ** 2;
          if (debug) {
            dispatch(
              setFadeData({
                player: 1,
                time: timeLeft,
                volume: currentPlayerVolume,
              })
            );
            dispatch(
              setFadeData({
                player: 2,
                time: timeLeft,
                volume: nextPlayerVolume,
              })
            );
          }
        } else {
          currentPlayerRef.current.audioEl.current.volume = currentPlayerVolume ** 2;
          nextPlayerRef.current.audioEl.current.volume = nextPlayerVolume ** 2;
          if (debug) {
            dispatch(
              setFadeData({
                player: 2,
                time: timeLeft,
                volume: currentPlayerVolume,
              })
            );
            dispatch(
              setFadeData({
                player: 1,
                time: timeLeft,
                volume: nextPlayerVolume,
              })
            );
          }
        }
      } else {
        nextPlayerRef.current.audioEl.current.volume = playQueue.volume ** 2;
      }
    }
  }

  // Conditions for scrobbling fading track
  // 1. Scrobble enabled in settings
  // 2. Not already scrobbled
  // 3. Track reached past 4 minutes or past the fadeAtTime - 15 seconds
  // 4. The track is not fading
  if (
    shouldScrobble &&
    !scrobbled &&
    (currentSeek >= 240 || currentSeek >= fadeAtTime - 15) &&
    currentSeek <= fadeAtTime
  ) {
    setScrobbled(true);
    apiController({
      serverType,
      endpoint: 'scrobble',
      args: {
        id: playQueue.currentSongId,
        albumId: playQueue.current.albumId,
        submission: true,
        position: serverType === Server.Jellyfin ? currentSeek * 1e7 : undefined,
      },
    });
  }
};

const Player = ({ currentEntryList, muted, children }: any, ref: any) => {
  const dispatch = useAppDispatch();
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const cacheSongs = settings.getSync('cacheSongs');
  const [title] = useState('');
  const [scrobbled, setScrobbled] = useState(false);

  const getSrc1 = useCallback(() => {
    const cachedSongPath = `${misc.imageCachePath}/${
      playQueue[currentEntryList][playQueue.player1.index]?.id
    }.mp3`;
    return isCached(cachedSongPath)
      ? cachedSongPath
      : playQueue[currentEntryList][playQueue.player1.index]?.streamUrl;
  }, [misc.imageCachePath, currentEntryList, playQueue]);

  const getSrc2 = useCallback(() => {
    const cachedSongPath = `${misc.imageCachePath}/${
      playQueue[currentEntryList][playQueue.player2.index]?.id
    }.mp3`;
    return isCached(cachedSongPath)
      ? cachedSongPath
      : playQueue[currentEntryList][playQueue.player2.index]?.streamUrl;
  }, [misc.imageCachePath, currentEntryList, playQueue]);

  useImperativeHandle(ref, () => ({
    get player1() {
      return player1Ref.current;
    },
    get player2() {
      return player2Ref.current;
    },
  }));

  useEffect(() => {
    if (player.status === 'PLAYING') {
      setTimeout(() => {
        if (playQueue.currentPlayer === 1) {
          try {
            player1Ref.current.audioEl.current.play();
          } catch (err) {
            console.log(err);
          }
        } else {
          try {
            player2Ref.current.audioEl.current.play();
          } catch (err) {
            console.log(err);
          }
        }
      }, 100);
    } else {
      // Hacky way to stop the player on quick polling intervals due to the fader continuously calling the play function
      setTimeout(() => {
        for (let i = 0; i <= 100; i += 1) {
          player1Ref.current.audioEl.current.pause();
        }
      }, 100);

      setTimeout(() => {
        for (let i = 0; i <= 100; i += 1) {
          player2Ref.current.audioEl.current.pause();
        }
      }, 100);
    }
  }, [playQueue.currentPlayer, player.status]);

  useEffect(() => {
    // Since we aren't able to request the time from the main process, we will continuously send it
    // for mpris-service's getPosition() function
    if (isLinux()) {
      const interval = setInterval(() => {
        if (player.status === 'PLAYING') {
          ipcRenderer.send(
            'current-position',
            playQueue.currentPlayer === 1
              ? player1Ref.current.audioEl.current.currentTime
              : player2Ref.current.audioEl.current.currentTime
          );
        } else {
          clearInterval(interval);
        }
      }, 500);

      return () => {
        clearInterval(interval);
      };
    }

    return undefined;
  }, [playQueue.currentPlayer, player.status]);

  useEffect(() => {
    if (playQueue.scrobble && player.status === 'PLAYING') {
      setScrobbled(false); // Only scrobble a single time per song change

      const currentSeek =
        playQueue.currentPlayer === 1
          ? player1Ref.current.audioEl.current?.currentTime
          : player2Ref.current.audioEl.current?.currentTime;

      // Handle gapless players
      if (playQueue.fadeDuration === 0 && currentSeek < 1) {
        const timer = setTimeout(() => {
          apiController({
            serverType: config.serverType,
            endpoint: 'scrobble',
            args: {
              id:
                playQueue.currentPlayer === 1
                  ? playQueue[currentEntryList][playQueue.player1.index]?.id
                  : playQueue[currentEntryList][playQueue.player2.index]?.id,
              submission: false,
              position: 5 * 1e7,
              event: 'start',
            },
          });
        }, 5000);

        return () => {
          clearTimeout(timer);
        };
      }

      // Handle crossfade players
      if (playQueue.fadeDuration !== 0 && currentSeek < playQueue.fadeDuration + 1) {
        const timer = setTimeout(() => {
          apiController({
            serverType: config.serverType,
            endpoint: 'scrobble',
            args: {
              id:
                playQueue.currentPlayer === 1
                  ? playQueue[currentEntryList][playQueue.player1.index]?.id
                  : playQueue[currentEntryList][playQueue.player2.index]?.id,
              submission: false,
              position: 5 * 1e7,
              event: 'start',
            },
          });
        }, 5000);

        return () => {
          clearTimeout(timer);
        };
      }
    }

    return undefined;
  }, [config.serverType, currentEntryList, playQueue, playQueue.currentPlayer, player.status]);

  useEffect(() => {
    // Adding a small delay when setting the track src helps to not break the player when we're modifying
    // the currentSongIndex such as when sorting the table, shuffling, or drag and dropping rows.
    // It can also prevent loading unneeded tracks when rapidly incrementing/decrementing the player.
    if (playQueue[currentEntryList].length > 0 && !playQueue.isFading) {
      const timer1 = setTimeout(() => {
        dispatch(setPlayerSrc({ player: 1, src: getSrc1() }));
      }, 100);

      const timer2 = setTimeout(() => {
        dispatch(setPlayerSrc({ player: 2, src: getSrc2() }));
      }, 100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    if (playQueue[currentEntryList].length > 0) {
      // If fading, just instantly switch the track, otherwise the player breaks
      // from the timeout due to the listen handlers that run during the fade
      // If switching to the NowPlayingView while on player1 and fading, dispatching
      // the src for player1 will cause the player to break

      dispatch(setPlayerSrc({ player: 1, src: getSrc1() }));
      dispatch(setPlayerSrc({ player: 2, src: getSrc2() }));
    }

    return undefined;
  }, [currentEntryList, dispatch, getSrc1, getSrc2, playQueue]);

  const handleListenPlayer1 = useCallback(() => {
    listenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      currentEntryList,
      dispatch,
      1,
      playQueue.fadeDuration,
      playQueue.fadeType,
      playQueue.volumeFade,
      playQueue.showDebugWindow,
      playQueue.scrobble,
      scrobbled,
      setScrobbled,
      config.serverType,
      playQueue[currentEntryList][playQueue.player1.index]?.duration
    );
  }, [config.serverType, currentEntryList, dispatch, playQueue, scrobbled]);

  const handleListenPlayer2 = useCallback(() => {
    listenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      currentEntryList,
      dispatch,
      2,
      playQueue.fadeDuration,
      playQueue.fadeType,
      playQueue.volumeFade,
      playQueue.showDebugWindow,
      playQueue.scrobble,
      scrobbled,
      setScrobbled,
      config.serverType,
      playQueue[currentEntryList][playQueue.player2.index]?.duration
    );
  }, [config.serverType, currentEntryList, dispatch, playQueue, scrobbled]);

  const handleOnEndedPlayer1 = useCallback(() => {
    player1Ref.current.audioEl.current.currentTime = 0;
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player1.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player1.index].streamUrl.replace(/stream/, 'download')
      );
    }

    if (playQueue.repeat === 'none' && playQueue.currentIndex === playQueue.entry.length - 1) {
      dispatch(fixPlayer2Index());
      player1Ref.current.audioEl.current.pause();
      player1Ref.current.audioEl.current.currentTime = 0;
      player2Ref.current.audioEl.current.pause();
      player2Ref.current.audioEl.current.currentTime = 0;

      ipcRenderer.send('playpause', {
        status: 'PAUSED',
        position:
          playQueue.currentPlayer === 1
            ? Math.floor(player1Ref.current.audioEl.current.currentTime * 1000000)
            : Math.floor(player2Ref.current.audioEl.current.currentTime * 1000000),
      });

      setTimeout(() => {
        dispatch(setStatus('PAUSED'));
      }, 250);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(setCurrentIndex(playQueue[currentEntryList][playQueue.player2.index]));
        dispatch(setAutoIncremented(true));
      }
      if (playQueue[currentEntryList].length > 0 || playQueue.repeat === 'all') {
        dispatch(setCurrentPlayer(2));
        dispatch(incrementPlayerIndex(1));
        if (playQueue.fadeDuration !== 0) {
          dispatch(setIsFading(false));
        }

        const nextSong =
          playQueue[currentEntryList][
            getNextPlayerIndex(
              playQueue[currentEntryList].length,
              playQueue.repeat,
              playQueue.player1.index
            )
          ];
        ipcRenderer.send('current-song', nextSong);

        dispatch(setAutoIncremented(false));
      }
    }
  }, [cacheSongs, currentEntryList, dispatch, playQueue]);

  const handleOnEndedPlayer2 = useCallback(() => {
    player2Ref.current.audioEl.current.currentTime = 0;
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player2.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player2.index].streamUrl.replace(/stream/, 'download')
      );
    }
    if (playQueue.repeat === 'none' && playQueue.currentIndex === playQueue.entry.length - 1) {
      dispatch(fixPlayer2Index());
      player1Ref.current.audioEl.current.pause();
      player1Ref.current.audioEl.current.currentTime = 0;
      player2Ref.current.audioEl.current.pause();
      player2Ref.current.audioEl.current.currentTime = 0;

      ipcRenderer.send('playpause', {
        status: 'PAUSED',
        position:
          playQueue.currentPlayer === 1
            ? Math.floor(player1Ref.current.audioEl.current.currentTime * 1000000)
            : Math.floor(player2Ref.current.audioEl.current.currentTime * 1000000),
      });

      setTimeout(() => {
        dispatch(setStatus('PAUSED'));
      }, 250);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(setCurrentIndex(playQueue[currentEntryList][playQueue.player1.index]));
        dispatch(setAutoIncremented(true));
      }
      if (playQueue[currentEntryList].length > 0 || playQueue.repeat === 'all') {
        dispatch(setCurrentPlayer(1));
        dispatch(incrementPlayerIndex(2));
        if (playQueue.fadeDuration !== 0) {
          dispatch(setIsFading(false));
        }

        const nextSong =
          playQueue[currentEntryList][
            getNextPlayerIndex(
              playQueue[currentEntryList].length,
              playQueue.repeat,
              playQueue.player2.index
            )
          ];
        ipcRenderer.send('current-song', nextSong);

        dispatch(setAutoIncremented(false));
      }
    }
  }, [cacheSongs, currentEntryList, dispatch, playQueue]);

  const handleGaplessPlayer1 = useCallback(() => {
    gaplessListenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      playQueue.pollingInterval,
      playQueue.scrobble,
      scrobbled,
      setScrobbled,
      config.serverType,
      config.serverType === Server.Subsonic
        ? player1Ref.current?.audioEl.current.duration
        : playQueue[currentEntryList][playQueue.player1.index]?.duration
    );
  }, [config.serverType, currentEntryList, playQueue, scrobbled]);

  const handleGaplessPlayer2 = useCallback(() => {
    gaplessListenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      playQueue.pollingInterval,
      playQueue.scrobble,
      scrobbled,
      setScrobbled,
      config.serverType,
      config.serverType === Server.Subsonic
        ? player2Ref.current?.audioEl.current.duration
        : playQueue[currentEntryList][playQueue.player2.index]?.duration
    );
  }, [config.serverType, currentEntryList, playQueue, scrobbled]);

  const handleOnPlay = useCallback(
    (playerNumber: 1 | 2) => {
      const currentSong =
        playerNumber === 1
          ? playQueue[currentEntryList][playQueue.player1.index]
          : playQueue[currentEntryList][playQueue.player2.index];

      ipcRenderer.send('current-song', playQueue.current);

      if (config.player.systemNotifications && currentSong) {
        // eslint-disable-next-line no-new
        new Notification(currentSong.title, {
          body: `${currentSong.artist.map((artist: Artist) => artist.title).join(', ')}\n${
            currentSong.album
          }`,
          icon: currentSong.image,
        });
      }

      if (config.serverType === Server.Jellyfin && playQueue.scrobble) {
        const currentSeek =
          playerNumber === 1
            ? player1Ref.current.audioEl.current.currentTime
            : player2Ref.current.audioEl.current.currentTime;

        apiController({
          serverType: config.serverType,
          endpoint: 'scrobble',
          args: {
            id: currentSong?.id,
            submission: false,
            position: currentSeek * 1e7,
            event: 'unpause',
          },
        });
      }
    },
    [config.serverType, config.player.systemNotifications, currentEntryList, playQueue]
  );

  const handleOnPause = useCallback(
    async (playerNumber: 1 | 2) => {
      if (config.serverType === Server.Jellyfin && playQueue.scrobble) {
        // Handle gapless pause
        const currentSeek =
          playerNumber === 1
            ? player1Ref.current.audioEl.current.currentTime
            : player2Ref.current.audioEl.current.currentTime;

        if (currentSeek > 3 && playQueue.fadeDuration === 0) {
          apiController({
            serverType: config.serverType,
            endpoint: 'scrobble',
            args: {
              id:
                playerNumber === 1
                  ? playQueue[currentEntryList][playQueue.player1.index]?.id
                  : playQueue[currentEntryList][playQueue.player2.index]?.id,
              submission: false,
              position: currentSeek * 1e7,
              event: 'pause',
            },
          });

          // Handle crossfade pause
        } else if (playQueue.fadeDuration !== 0 && !playQueue.isFading) {
          apiController({
            serverType: config.serverType,
            endpoint: 'scrobble',
            args: {
              id:
                playerNumber === 1
                  ? playQueue[currentEntryList][playQueue.player1.index]?.id
                  : playQueue[currentEntryList][playQueue.player2.index]?.id,
              submission: false,
              position: currentSeek * 1e7,
              event: 'pause',
            },
          });
        }
      }
    },
    [config.serverType, currentEntryList, playQueue]
  );

  useEffect(() => {
    if (config.playback.audioDeviceId) {
      player1Ref.current.audioEl.current.setSinkId(config.playback.audioDeviceId);
      player2Ref.current.audioEl.current.setSinkId(config.playback.audioDeviceId);
    } else {
      player1Ref.current.audioEl.current.setSinkId('');
      player2Ref.current.audioEl.current.setSinkId('');
    }
  }, [config.playback.audioDeviceId]);

  // Reset the player volumes when the track changes
  useEffect(() => {
    if (!playQueue.isFading || !(playQueue.fadeDuration === 0)) {
      if (playQueue.currentPlayer === 1) {
        player1Ref.current.audioEl.current.volume = playQueue.volume ** 2;
        player2Ref.current.audioEl.current.volume = 0;
      } else {
        player2Ref.current.audioEl.current.volume = playQueue.volume ** 2;
        player1Ref.current.audioEl.current.volume = 0;
      }
    }
  }, [playQueue.currentPlayer, playQueue.fadeDuration, playQueue.isFading, playQueue.volume]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <ReactAudioPlayer
        ref={player1Ref}
        src={playQueue.player1.src}
        onPlay={() => handleOnPlay(1)}
        onPause={() => handleOnPause(1)}
        listenInterval={playQueue.pollingInterval}
        preload="auto"
        onListen={playQueue.fadeDuration === 0 ? handleGaplessPlayer1 : handleListenPlayer1}
        onEnded={handleOnEndedPlayer1}
        volume={player1Ref.current?.audioEl?.current?.volume || 0}
        autoPlay={
          playQueue.player1.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 1 &&
          player.status === 'PLAYING'
        }
        onError={() => {
          if (config.serverType !== Server.Jellyfin) {
            if (playQueue[currentEntryList].length > 0) {
              player1Ref.current.audioEl.current.src = './components/player/dummy.mp3';
              player1Ref.current.audioEl.current.src = getSrc1();
            }
          }
        }}
        muted={muted}
        crossOrigin="anonymous"
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={playQueue.player2.src}
        onPlay={() => handleOnPlay(2)}
        onPause={() => handleOnPause(2)}
        listenInterval={playQueue.pollingInterval}
        preload="auto"
        onListen={playQueue.fadeDuration === 0 ? handleGaplessPlayer2 : handleListenPlayer2}
        onEnded={handleOnEndedPlayer2}
        volume={player2Ref.current?.audioEl?.current?.volume || 0}
        autoPlay={
          playQueue.player2.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 2 &&
          player.status === 'PLAYING'
        }
        onError={() => {
          if (config.serverType !== Server.Jellyfin) {
            if (playQueue[currentEntryList].length > 0) {
              player2Ref.current.audioEl.current.src = './components/player/dummy.mp3';
              player2Ref.current.audioEl.current.src = getSrc2();
            }
          }
        }}
        muted={muted}
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
};

export default forwardRef(Player);
