import React, { useEffect, useState } from 'react';
import settings from 'electron-settings';
import { shell } from 'electron';
import axios from 'axios';
import { InfoModal } from './PageModal';
import { StyledButton } from '../shared/styled';
import { ConfigPanel } from '../settings/styled';

const ReleaseNotes = () => {
  const [show, setShow] = useState(Boolean(settings.getSync('autoUpdateNotice')));
  const [releaseDetails, setReleaseDetails] = useState<any>();

  useEffect(() => {
    const fetchReleaseNotes = async () => {
      const { data } = await axios.get(
        'https://api.github.com/repos/jeffvli/sonixd/releases/latest'
      );

      setReleaseDetails({ tag: data.tag_name, notes: data.body });
    };

    fetchReleaseNotes();
  }, []);

  if (!show) {
    return <></>;
  }

  return (
    <InfoModal
      show={show}
      handleHide={() => {
        setShow(false);
        settings.setSync('autoUpdateNotice', false);
      }}
    >
      <ConfigPanel>
        <h1>
          {releaseDetails?.tag}
          <StyledButton
            onClick={() => shell.openExternal('https://github.com/jeffvli/sonixd/releases/latest')}
            appearance="primary"
            size="sm"
            style={{ marginLeft: '10px' }}
          >
            View on GitHub
          </StyledButton>
        </h1>
        <p>{releaseDetails?.notes}</p>
      </ConfigPanel>
    </InfoModal>
  );
};

export default ReleaseNotes;
