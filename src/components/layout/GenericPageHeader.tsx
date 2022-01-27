import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useHistory } from 'react-router-dom';
import { Icon, InputGroup } from 'rsuite';
import ViewTypeButtons from '../viewtypes/ViewTypeButtons';
import {
  StyledIconButton,
  StyledInput,
  StyledInputGroup,
  StyledInputGroupButton,
} from '../shared/styled';
import {
  CoverArtWrapper,
  CustomImageGrid,
  CustomImageGridWrapper,
  PageHeaderSubtitleWrapper,
  PageHeaderTitle,
  PageHeaderWrapper,
} from './styled';
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
  isDark,
}: any) => {
  const history = useHistory();
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <>
      {image && !Array.isArray(image) && (
        <CoverArtWrapper size={imageHeight || '195px'} card={typeof image !== 'string'}>
          {typeof image !== 'string' ? (
            <>{image}</>
          ) : (
            <LazyLoadImage
              src={image}
              alt="header-img"
              height={imageHeight || '195px'}
              visibleByDefault
              afterLoad={() => {
                if (cacheImages.enabled) {
                  cacheImage(
                    `${cacheImages.cacheType}_${cacheImages.id}.jpg`,
                    image.replaceAll(/=150/gi, '=350')
                  );
                }
              }}
            />
          )}
        </CoverArtWrapper>
      )}

      {image && Array.isArray(image) && (
        <CoverArtWrapper size={imageHeight || '195px'}>
          <CustomImageGridWrapper>
            <CustomImageGrid $gridArea="1 / 1 / 2 / 2">
              <LazyLoadImage
                src={image[0]}
                alt="header-img"
                height={imageHeight / 2}
                width={imageHeight / 2}
              />
            </CustomImageGrid>
            <CustomImageGrid $gridArea="1 / 2 / 2 / 3">
              <LazyLoadImage
                src={image[1]}
                alt="header-img"
                height={imageHeight / 2}
                width={imageHeight / 2}
              />
            </CustomImageGrid>
            <CustomImageGrid $gridArea="2 / 1 / 3 / 2">
              <LazyLoadImage
                src={image[2]}
                alt="header-img"
                height={imageHeight / 2}
                width={imageHeight / 2}
              />
            </CustomImageGrid>
            <CustomImageGrid $gridArea="2 / 2 / 3 / 3">
              <LazyLoadImage
                src={image[3]}
                alt="header-img"
                height={imageHeight / 2}
                width={imageHeight / 2}
              />
            </CustomImageGrid>
          </CustomImageGridWrapper>
        </CoverArtWrapper>
      )}

      <PageHeaderWrapper isDark={isDark} hasImage={image} imageHeight={imageHeight || 195}>
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
                      opacity={0.6}
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
                        const searchInput = document.getElementById(
                          'local-search-input'
                        ) as HTMLInputElement;
                        searchInput.focus();
                        searchInput.select();
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
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}
        >
          <PageHeaderSubtitleWrapper>{subtitle}</PageHeaderSubtitleWrapper>
          <span style={{ alignSelf: 'flex-end' }}>
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
      </PageHeaderWrapper>
    </>
  );
};

export default GenericPageHeader;
