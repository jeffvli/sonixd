import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Icon, Input, InputGroup } from 'rsuite';
import ViewTypeButtons from '../viewtypes/ViewTypeButtons';

const GenericPageHeader = ({
  image,
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
}: any) => {
  return (
    <>
      {image && (
        <div style={{ display: 'inline-block' }}>
          {image && <LazyLoadImage src={image} effect="opacity" height="150" />}
        </div>
      )}

      <div
        style={{
          display: 'inline-block',
          width: image ? 'calc(100% - 160px)' : '100%',
          marginLeft: image ? '10px' : '0px',
          height: '100%',
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
            <h1
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '50%',
          }}
        >
          <span style={{ alignSelf: 'center' }}>{subtitle}</span>
          <span style={{ alignSelf: 'center' }}>
            {subsidetitle && (
              <span style={{ display: 'inline-block' }}>{subsidetitle}</span>
            )}
            {showViewTypeButtons && (
              <span style={{ display: 'inline-block' }}>
                <ViewTypeButtons
                  handleListClick={handleListClick}
                  handleGridClick={handleGridClick}
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
