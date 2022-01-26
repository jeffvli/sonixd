import React from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setImgModal } from '../../redux/miscSlice';

const BackgroundOverlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  user-select: none;

  padding: 7rem 2rem 7rem 2rem;
  justify-content: center;
  align-items: center;
  display: flex;
  background: rgba(10, 10, 10, 0.5);
`;

const ImageContainer = styled.div`
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
`;

const Image = styled.img`
  max-height: 100%;
  max-width: 100%;
  height: auto;
  display: block;
  vertical-align: middle;
  border-style: solid;
  z-index: 1;
  user-drag: none;
`;

const ImageModal = () => {
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);

  if (misc.imgModal.show) {
    return (
      <BackgroundOverlay onClick={() => dispatch(setImgModal({ ...misc.imgModal, show: false }))}>
        <ImageContainer>
          <Image src={misc.imgModal.src} />
        </ImageContainer>
      </BackgroundOverlay>
    );
  }

  return <></>;
};

export default ImageModal;
