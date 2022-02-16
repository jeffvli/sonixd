import React, { useEffect, useState } from 'react';
import { Divider } from 'rsuite';
import settings from 'electron-settings';
import { shell } from 'electron';
import axios from 'axios';
import { InfoModal } from './Modal';
import { StyledButton } from '../shared/styled';
import { ConfigPanel } from '../settings/styled';
import CenterLoader from '../loader/CenterLoader';

const ReleaseNotes = () => {
  const [show, setShow] = useState(Boolean(settings.getSync('autoUpdateNotice')));
  const [releaseDetails, setReleaseDetails] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchReleaseNotes = async () => {
      const { data } = await axios.get(
        'https://api.github.com/repos/jeffvli/sonixd/releases?per_page=4'
      );

      setReleaseDetails(
        data.map((release: any) => {
          return { tag: release.tag_name, notes: release.body };
        })
      );
    };

    fetchReleaseNotes();
    setIsLoading(false);
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
        {isLoading && <CenterLoader />}

        {releaseDetails?.map((release: { tag: string; notes: string }) => {
          return (
            <>
              <h1>
                {release?.tag}
                <StyledButton
                  onClick={() =>
                    shell.openExternal(`https://github.com/jeffvli/sonixd/releases/${release.tag}`)
                  }
                  appearance="primary"
                  size="sm"
                  style={{ marginLeft: '10px' }}
                >
                  View on GitHub
                </StyledButton>
              </h1>
              <p>{release?.notes}</p>
              <Divider />
            </>
          );
        })}
      </ConfigPanel>
    </InfoModal>
  );
};

export default ReleaseNotes;
