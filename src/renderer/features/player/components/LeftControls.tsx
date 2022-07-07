import { LazyLoadImage as Image } from 'react-lazy-load-image-component';
import styled from 'styled-components';
import { Text } from 'renderer/components';
import { usePlayerStore } from 'renderer/store';

const LeftControlsContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const ImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
`;

const MetadataStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
  justify-content: center;
`;

export const LeftControls = () => {
  const song = usePlayerStore((state) => state.current.song);
  const title = song?.title;
  const artists = song?.artist?.map((artist) => artist?.title).join(', ');
  const album = song?.album;

  console.log('f');

  return (
    <LeftControlsContainer>
      <ImageWrapper>
        <Image height={60} src={song?.image} width={60} />
      </ImageWrapper>
      <MetadataStack>
        <Text
          link={!!title}
          overflow="hidden"
          size="sm"
          to="/nowplaying"
          weight={600}
        >
          {title || '—'}
        </Text>
        <Text
          secondary
          link={!!artists}
          overflow="hidden"
          size="sm"
          to="/nowplaying"
          weight={600}
        >
          {artists || '—'}
        </Text>
        <Text
          secondary
          link={!!album}
          overflow="hidden"
          size="sm"
          to="/nowplaying"
        >
          {album || '—'}
        </Text>
      </MetadataStack>
    </LeftControlsContainer>
  );
};
