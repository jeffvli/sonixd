import React from 'react';
import { Icon, Modal } from 'rsuite';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { decrementModalPage, hideModal, setContextMenu } from '../../redux/miscSlice';
import { StyledIconButton } from '../shared/styled';
import ArtistView from '../library/ArtistView';
import AlbumView from '../library/AlbumView';
import PlaylistView from '../playlist/PlaylistView';

const StyledModal = styled(Modal)<{ width?: string }>`
  color: ${(props) => `${props.theme.colors.layout.page.color} !important`};

  .rs-modal-dialog {
    width: ${(props) => props.width};
  }

  .rs-modal-body {
    margin-top: 0px;
    padding-bottom: 0px;
    white-space: pre-wrap;
  }

  .rs-modal-content {
    background: ${(props) => `${props.theme.colors.layout.page.background} !important`};
  }
`;

export const PageModal = () => {
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);

  return (
    <StyledModal
      width="750px"
      show={misc.modal.show}
      onHide={() => dispatch(hideModal())}
      onExit={() => dispatch(hideModal())}
      overflow
      full
    >
      <Modal.Header onClick={() => dispatch(setContextMenu({ show: false }))}>
        <StyledIconButton
          appearance="subtle"
          icon={<Icon icon="arrow-circle-left" />}
          onClick={() => {
            dispatch(decrementModalPage());
          }}
        />
      </Modal.Header>
      <Modal.Body
        style={{ height: '800px' }}
        onClick={() => dispatch(setContextMenu({ show: false }))}
      >
        {misc.modalPages[misc.modal.currentPageIndex]?.pageType === 'artist' && (
          <ArtistView id={misc.modalPages[misc.modal.currentPageIndex].id} isModal />
        )}
        {misc.modalPages[misc.modal.currentPageIndex]?.pageType === 'album' && (
          <AlbumView id={misc.modalPages[misc.modal.currentPageIndex].id} isModal />
        )}
        {misc.modalPages[misc.modal.currentPageIndex]?.pageType === 'playlist' && (
          <PlaylistView id={misc.modalPages[misc.modal.currentPageIndex].id} isModal />
        )}
      </Modal.Body>
    </StyledModal>
  );
};

export const InfoModal = ({ show, handleHide, width, children }: any) => {
  return (
    <StyledModal width={width} show={show} full overflow onHide={handleHide} onExit={handleHide}>
      <Modal.Body>{children}</Modal.Body>
    </StyledModal>
  );
};
