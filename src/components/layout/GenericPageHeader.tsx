import React from 'react';
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
  subtitle,
  sidetitle,
  subsidetitle,
  searchQuery,
  clearSearchQuery,
  handleSearch,
  showViewTypeButtons,
  showSearchBar,
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
          {sidetitle}
          {showSearchBar && (
            <InputGroup inside>
              <Input
                size="md"
                value={searchQuery}
                placeholder="Search..."
                onChange={handleSearch}
              />
              {searchQuery !== '' && (
                <InputGroup.Button appearance="subtle">
                  <Icon icon="close" onClick={clearSearchQuery} />
                </InputGroup.Button>
              )}
            </InputGroup>
          )}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ alignSelf: 'center' }}>{subtitle}</span>
        <span style={{ alignSelf: 'center' }}>
          {subsidetitle}
          {showViewTypeButtons && (
            <ButtonToolbar>
              <ButtonGroup>
                <IconButton icon={<Icon icon="list" />} appearance="link" />
                <IconButton icon={<Icon icon="th-large" />} appearance="link" />
              </ButtonGroup>
            </ButtonToolbar>
          )}
        </span>
      </div>
    </>
  );
};

export default GenericPageHeader;
