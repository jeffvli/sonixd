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
          {sidetitle && (
            <span style={{ display: 'inline-block' }}>{sidetitle}</span>
          )}
          {showSearchBar && (
            <span style={{ display: 'inline-block' }}>
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
            </span>
          )}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ alignSelf: 'center' }}>{subtitle}</span>
        <span style={{ alignSelf: 'center' }}>
          {subsidetitle && (
            <span style={{ display: 'inline-block' }}>{subsidetitle}</span>
          )}
          {showViewTypeButtons && (
            <span style={{ display: 'inline-block' }}>
              <ButtonToolbar>
                <ButtonGroup>
                  <IconButton icon={<Icon icon="list" />} appearance="subtle" />
                  <IconButton
                    icon={<Icon icon="th-large" />}
                    appearance="subtle"
                  />
                </ButtonGroup>
              </ButtonToolbar>
            </span>
          )}
        </span>
      </div>
    </>
  );
};

export default GenericPageHeader;
