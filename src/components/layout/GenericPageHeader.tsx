import React from 'react';
import { Icon, Input, InputGroup } from 'rsuite';
import ViewTypeButtons from '../viewtypes/ViewTypeButtons';

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
  return (
    <>
      {image && (
        <div
          style={{
            display: 'inline-block',
            filter: 'drop-shadow(0px 0px 6px #000)',
          }}
        >
          <img
            src={image}
            alt="header-img"
            height={imageHeight || '145px'}
            width={imageHeight || '145px'}
          />
        </div>
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
                    id="local-search-input"
                    size="md"
                    value={searchQuery}
                    placeholder="Search..."
                    onChange={handleSearch}
                  />
                  {searchQuery !== '' && (
                    <InputGroup.Button
                      appearance="subtle"
                      onClick={clearSearchQuery}
                    >
                      <Icon icon="close" />
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
            {subsidetitle && (
              <span style={{ display: 'inline-block' }}>{subsidetitle}</span>
            )}
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
