import React, { useState } from 'react';
import {
  IconButton,
  ButtonGroup,
  ButtonToolbar,
  Icon,
  Input,
  InputGroup,
} from 'rsuite';

const GenericPageHeader = ({
  title,
  tags,
  handleSearch,
  showViewTypeButtons,
}: any) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          <h1>{title}</h1>
        </span>
        <span
          style={{
            alignSelf: 'center',
          }}
        >
          <InputGroup inside>
            <Input size="md" onChange={handleSearch} />
            <InputGroup.Addon>
              <Icon icon="search" />
            </InputGroup.Addon>
          </InputGroup>
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ alignSelf: 'center' }}>{tags}</span>
        {showViewTypeButtons && (
          <span style={{ alignSelf: 'center' }}>
            <ButtonToolbar>
              <ButtonGroup>
                <IconButton icon={<Icon icon="list" />} appearance="link" />
                <IconButton icon={<Icon icon="th-large" />} appearance="link" />
              </ButtonGroup>
            </ButtonToolbar>
          </span>
        )}
      </div>
    </>
  );
};

export default GenericPageHeader;
