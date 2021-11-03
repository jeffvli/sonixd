import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useHistory } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { Icon, InputGroup } from 'rsuite';
import ViewTypeButtons from '../viewtypes/ViewTypeButtons';
import {
  StyledIconButton,
  StyledInput,
  StyledInputGroup,
  StyledInputGroupButton,
} from '../shared/styled';
import { CoverArtWrapper, PageHeaderTitle } from './styled';
import cacheImage from '../shared/cacheImage';
import CustomTooltip from '../shared/CustomTooltip';

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
  cacheImages,
  showTitleTooltip,
}: any) => {
  const history = useHistory();
  const [openSearch, setOpenSearch] = useState(false);

  useHotkeys('ctrl+f', () => {
    setOpenSearch(true);
    document.getElementById('local-search-input')?.focus();
  });

  return (
    <>
      {image && (
        <CoverArtWrapper>
          <LazyLoadImage
            src={image}
            alt="header-img"
            height={imageHeight || '145px'}
            width={imageHeight || '145px'}
            visibleByDefault
            afterLoad={() => {
              if (cacheImages.enabled) {
                cacheImage(
                  `${cacheImages.cacheType}_${cacheImages.id}.jpg`,
                  image.replace(/size=\d+/, 'size=500')
                );
              }
            }}
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
              width: '80%',
              overflow: 'hidden',
            }}
          >
            {showTitleTooltip ? (
              <CustomTooltip text={title} placement="bottom">
                <PageHeaderTitle>{title}</PageHeaderTitle>
              </CustomTooltip>
            ) : (
              <PageHeaderTitle>{title}</PageHeaderTitle>
            )}
          </span>
          <span
            style={{
              alignSelf: 'center',
            }}
          >
            {sidetitle && <span style={{ display: 'inline-block' }}>{sidetitle}</span>}
            {showSearchBar && (
              <span style={{ display: 'inline-block' }}>
                {searchQuery !== '' || openSearch ? (
                  <StyledInputGroup inside>
                    <InputGroup.Addon>
                      <Icon icon="search" />
                    </InputGroup.Addon>
                    <StyledInput
                      id="local-search-input"
                      value={searchQuery}
                      onChange={handleSearch}
                      onPressEnter={() => {
                        if (searchQuery.trim()) {
                          history.push(`/search?query=${searchQuery}`);
                        }
                      }}
                      onKeyDown={(e: KeyboardEvent) => {
                        if (e.key === 'Escape') {
                          clearSearchQuery();
                          setOpenSearch(false);
                        }
                      }}
                      style={{ width: '180px' }}
                    />
                    <StyledInputGroupButton
                      tabIndex={0}
                      appearance="subtle"
                      onClick={() => {
                        clearSearchQuery();
                        setOpenSearch(false);
                      }}
                      onKeyDown={(e: any) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          clearSearchQuery();
                          setOpenSearch(false);
                        }
                      }}
                    >
                      <Icon icon="close" />
                    </StyledInputGroupButton>
                  </StyledInputGroup>
                ) : (
                  <StyledIconButton
                    onClick={() => {
                      setOpenSearch(true);
                      setTimeout(() => {
                        document.getElementById('local-search-input')?.focus();
                      }, 50);
                    }}
                    appearance="subtle"
                    icon={<Icon icon="search" />}
                  />
                )}
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
              width: '60%',
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
