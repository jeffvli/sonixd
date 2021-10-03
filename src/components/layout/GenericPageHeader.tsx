import React from 'react';
import { useHistory } from 'react-router-dom';
import { Icon, Input, InputGroup } from 'rsuite';
import ViewTypeButtons from '../viewtypes/ViewTypeButtons';
import { StyledInputGroup } from '../shared/styled';
import { CoverArtWrapper, PageHeaderTitle } from './styled';

const GenericPageHeader = ({
  image,
  imageHeight,
  title,
  subtitle,
  sidetitle,
  subsidetitle,
  searchQuery,
  clearSearchQuery,
  handleSearch,
  showViewTypeButtons,
  showSearchBar,
  handleListClick,
  handleGridClick,
  viewTypeSetting,
}: any) => {
  const history = useHistory();

  return (
    <>
      {image && (
        <CoverArtWrapper>
          <img
            src={image}
            alt="header-img"
            height={imageHeight || '145px'}
            width={imageHeight || '145px'}
          />
        </CoverArtWrapper>
      )}

      <div
        style={{
          display: image ? 'inline-block' : 'undefined',
          width: image ? 'calc(100% - 160px)' : '100%',
          marginLeft: image ? '15px' : '0px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              display: 'flex',
              width: '45%',
              overflow: 'hidden',
            }}
          >
            <PageHeaderTitle>{title}</PageHeaderTitle>
          </span>
          <span
            style={{
              alignSelf: 'center',
            }}
          >
            {sidetitle && <span style={{ display: 'inline-block' }}>{sidetitle}</span>}
            {showSearchBar && (
              <span style={{ display: 'inline-block' }}>
                <StyledInputGroup inside>
                  <Input
                    id="local-search-input"
                    size="md"
                    value={searchQuery}
                    placeholder="Search..."
                    onChange={handleSearch}
                    onPressEnter={() => {
                      if (searchQuery.trim()) {
                        history.push(`/search?query=${searchQuery}`);
                      }
                    }}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === 'Escape') {
                        clearSearchQuery();
                      }
                    }}
                  />
                  {searchQuery !== '' && (
                    <InputGroup.Button appearance="subtle" onClick={clearSearchQuery}>
                      <Icon icon="close" />
                    </InputGroup.Button>
                  )}
                </StyledInputGroup>
              </span>
            )}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '50%',
          }}
        >
          <span
            style={{
              alignSelf: 'center',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              width: '55%',
            }}
          >
            {subtitle}
          </span>
          <span style={{ alignSelf: 'center' }}>
            {subsidetitle && <span style={{ display: 'inline-block' }}>{subsidetitle}</span>}
            {showViewTypeButtons && (
              <span style={{ display: 'inline-block' }}>
                <ViewTypeButtons
                  handleListClick={handleListClick}
                  handleGridClick={handleGridClick}
                  viewTypeSetting={viewTypeSetting}
                />
              </span>
            )}
          </span>
        </div>
      </div>
    </>
  );
};

export default GenericPageHeader;
