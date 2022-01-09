import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TitleHeader,
  DragRegion,
  WindowControl,
  WindowControlButton,
  MacControl,
  MacControlButton,
} from './styled';
import { useAppSelector } from '../../redux/hooks';
import { getCurrentEntryList } from '../../shared/utils';
import logo from '../../../assets/icon.png';

const Titlebar = ({ font }: any) => {
  const { t } = useTranslation();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const misc = useAppSelector((state) => state.misc);
  const [title, setTitle] = useState(document.title);
  const [hoverMin, setHoverMin] = useState(false);
  const [hoverMax, setHoverMax] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);

  useEffect(() => {
    const currentEntryList = getCurrentEntryList(playQueue);

    const playStatus =
      player.status !== 'PLAYING' && playQueue[currentEntryList].length > 0 ? t('(Paused)') : '';

    const songTitle = playQueue[currentEntryList][playQueue.currentIndex]?.title
      ? `(${playQueue.currentIndex + 1} / ${playQueue[currentEntryList].length}) ~ ${
          playQueue[currentEntryList][playQueue.currentIndex]?.title
        } ~ ${playQueue[currentEntryList][playQueue.currentIndex]?.artist[0]?.title} `
      : 'Sonixd';

    setTitle(`${playStatus} ${songTitle}`.trim());
    document.title = `${playStatus} ${songTitle}`.trim();
  }, [playQueue, player.status, t]);

  // if the titlebar is native return no custom titlebar
  if (misc.titleBar === 'native') {
    return null;
  }

  return (
    <TitleHeader id="titlebar" font={font}>
      <DragRegion id="drag-region">
        {misc.titleBar === 'mac' && (
          <>
            <div id="window-title-wrapper-mac">
              <span id="window-title-mac">{title}</span>
            </div>

            <MacControl id="window-controls">
              <MacControlButton
                minButton
                className="button"
                id="min-button"
                onMouseOver={() => setHoverMin(true)}
                onMouseLeave={() => setHoverMin(false)}
              >
                <img
                  className="icon"
                  draggable="false"
                  alt=""
                  src={`img/icons/min-mac${hoverMin ? '-hover' : ''}.png`}
                />
              </MacControlButton>
              <MacControlButton
                maxButton
                className="button"
                id="max-button"
                onMouseOver={() => setHoverMax(true)}
                onMouseLeave={() => setHoverMax(false)}
              >
                <img
                  className="icon"
                  draggable="false"
                  alt=""
                  src={`img/icons/max-mac${hoverMax ? '-hover' : ''}.png`}
                />
              </MacControlButton>
              <MacControlButton
                restoreButton
                className="button"
                id="restore-button"
                onMouseOver={() => setHoverMax(true)}
                onMouseLeave={() => setHoverMax(false)}
              >
                <img
                  className="icon"
                  src={`img/icons/max-mac${hoverMax ? '-hover' : ''}.png`}
                  draggable="false"
                  alt=""
                />
              </MacControlButton>
              <MacControlButton
                className="button"
                id="close-button"
                onMouseOver={() => setHoverClose(true)}
                onMouseLeave={() => setHoverClose(false)}
              >
                <img
                  className="icon"
                  src={`img/icons/close-mac${hoverClose ? '-hover' : ''}.png`}
                  draggable="false"
                  alt=""
                />
              </MacControlButton>
            </MacControl>
          </>
        )}

        {misc.titleBar !== 'mac' && (
          <>
            <div id="window-title-wrapper">
              <span id="window-title">
                <img src={logo} height="20px" width="20px" alt="" style={{ marginRight: '5px' }} />
                {title}
              </span>
            </div>
            <WindowControl id="window-controls">
              <WindowControlButton minButton className="button" id="min-button">
                <img
                  className="icon"
                  srcSet="img/icons/min-w-10.png 1x, img/icons/min-w-12.png 1.25x, img/icons/min-w-15.png 1.5x, img/icons/min-w-15.png 1.75x, img/icons/min-w-20.png 2x, img/icons/min-w-20.png 2.25x, img/icons/min-w-24.png 2.5x, img/icons/min-w-30.png 3x, img/icons/min-w-30.png 3.5x"
                  draggable="false"
                  alt=""
                />
              </WindowControlButton>
              <WindowControlButton maxButton className="button" id="max-button">
                <img
                  className="icon"
                  srcSet="img/icons/max-w-10.png 1x, img/icons/max-w-12.png 1.25x, img/icons/max-w-15.png 1.5x, img/icons/max-w-15.png 1.75x, img/icons/max-w-20.png 2x, img/icons/max-w-20.png 2.25x, img/icons/max-w-24.png 2.5x, img/icons/max-w-30.png 3x, img/icons/max-w-30.png 3.5x"
                  draggable="false"
                  alt=""
                />
              </WindowControlButton>
              <WindowControlButton restoreButton className="button" id="restore-button">
                <img
                  className="icon"
                  srcSet="img/icons/restore-w-10.png 1x, img/icons/restore-w-12.png 1.25x, img/icons/restore-w-15.png 1.5x, img/icons/restore-w-15.png 1.75x, img/icons/restore-w-20.png 2x, img/icons/restore-w-20.png 2.25x, img/icons/restore-w-24.png 2.5x, img/icons/restore-w-30.png 3x, img/icons/restore-w-30.png 3.5x"
                  draggable="false"
                  alt=""
                />
              </WindowControlButton>
              <WindowControlButton className="button" id="close-button">
                <img
                  className="icon"
                  srcSet="img/icons/close-w-10.png 1x, img/icons/close-w-12.png 1.25x, img/icons/close-w-15.png 1.5x, img/icons/close-w-15.png 1.75x, img/icons/close-w-20.png 2x, img/icons/close-w-20.png 2.25x, img/icons/close-w-24.png 2.5x, img/icons/close-w-30.png 3x, img/icons/close-w-30.png 3.5x"
                  draggable="false"
                  alt=""
                />
              </WindowControlButton>
            </WindowControl>
          </>
        )}
      </DragRegion>
    </TitleHeader>
  );
};

export default Titlebar;
