import React from 'react';
import { Icon, Modal } from 'rsuite';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { decrementModalPage, hideModal, setContextMenu } from '../../redux/miscSlice';
import { StyledButton } from '../shared/styled';
import ArtistView from '../library/ArtistView';
import AlbumView from '../library/AlbumView';
import PlaylistView from '../playlist/PlaylistView';

const StyledModal = styled(Modal)`
  color: ${(props) => `${props.theme.primary.text} !important`};

  .rs-modal-body {
    margin-top: 0px;
  }

  .rs-modal-content {
    background: ${(props) => `${props.theme.primary.background} !important`};
  }

  .rs-container {
    overflow-y: hidden;
  }
`;

const PageModal = () => {
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);

  return (
    <StyledModal
      show={misc.modal.show}
      onHide={() => dispatch(hideModal())}
      onExit={() => dispatch(hideModal())}
      full
    >
      <Modal.Header onClick={() => dispatch(setContextMenu({ show: false }))}>
        <StyledButton
          appearance="link"
          onClick={() => {
            dispatch(decrementModalPage());
          }}
        >
          <Icon icon="arrow-circle-left" />
        </StyledButton>
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

export default PageModal;
