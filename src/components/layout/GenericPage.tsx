import React, { useEffect, useState } from 'react';
import { Divider } from 'rsuite';
import { useAppSelector } from '../../redux/hooks';
import { PageContainer, PageHeader, PageContent } from './styled';
import { isCached } from '../../shared/utils';

const GenericPage = ({ header, children, hideDivider, ...rest }: any) => {
  const playQueue = useAppSelector((state) => state.playQueue);
  const misc = useAppSelector((state) => state.misc);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    if (misc.dynamicBackground) {
      const cachedImagePath = `${misc.imageCachePath}album_${playQueue.current?.albumId}.jpg`;
      const serverImagePath = playQueue.current?.image.replace(/size=\d+/, 'size=500');
      const cssBackgroundImagePath =
        `${misc.imageCachePath}album_${playQueue.current?.albumId}.jpg`.replaceAll('\\', '/');

      if (!isCached(cachedImagePath)) {
        const preloadImage = new Image();
        preloadImage.src = serverImagePath;
      }

      const imagePath = isCached(cachedImagePath) ? cssBackgroundImagePath : serverImagePath;

      setBackgroundImage(imagePath);
    }
  }, [misc.imageCachePath, misc.dynamicBackground, playQueue]);

  return (
    <PageContainer
      id="page-container"
      $backgroundSrc={
        misc.dynamicBackground
          ? !backgroundImage?.match('placeholder')
            ? backgroundImage
            : undefined
          : undefined
      }
    >
      <PageHeader
        id="page-header"
        padding={rest.padding}
        style={{ paddingBottom: hideDivider && !rest.padding ? '10px' : '0px' }}
      >
        {header}
      </PageHeader>
      {!hideDivider && <Divider />}
      <PageContent id="page-content" padding={rest.padding} $zIndex={rest.contentZIndex}>
        {children}
      </PageContent>
    </PageContainer>
  );
};

export default GenericPage;
