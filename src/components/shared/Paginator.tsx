import React from 'react';
import { ButtonGroup, ButtonToolbar, FlexboxGrid, Icon, Whisper } from 'rsuite';
import Popup from './Popup';
import { SecondaryTextWrapper, StyledButton, StyledIconButton, StyledPagination } from './styled';

const Paginator = ({ startIndex, endIndex, handleGoToButton, children, ...rest }: any) => {
  return (
    <>
      <FlexboxGrid
        justify="space-between"
        style={{
          paddingLeft: '10px',
          paddingTop: '15px',
          width: rest.bottom && '100%',
          bottom: '0px',
          position: rest.bottom && 'absolute',
        }}
      >
        <FlexboxGrid.Item style={{ alignSelf: 'center' }}>
          {children}
          <SecondaryTextWrapper subtitle="true">
            {startIndex && startIndex}
            {startIndex && endIndex && ` - ${endIndex}`}
          </SecondaryTextWrapper>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item style={{ alignSelf: 'center' }}>
          <StyledPagination {...rest} />
          {handleGoToButton && (
            <Whisper
              enterable
              preventOverflow
              placement="autoVerticalEnd"
              trigger="click"
              speaker={
                <Popup>
                  <ButtonGroup>
                    <StyledButton
                      appearance="subtle"
                      onClick={() =>
                        handleGoToButton(
                          rest.activePage + 5 < rest.pages ? rest.activePage + 5 : rest.pages
                        )
                      }
                    >
                      +5
                    </StyledButton>
                    <StyledButton
                      appearance="subtle"
                      onClick={() =>
                        handleGoToButton(
                          rest.activePage + 15 < rest.pages ? rest.activePage + 15 : rest.pages
                        )
                      }
                    >
                      +15
                    </StyledButton>
                    <StyledButton
                      appearance="subtle"
                      onClick={() =>
                        handleGoToButton(
                          rest.activePage + 50 < rest.pages ? rest.activePage + 50 : rest.pages
                        )
                      }
                    >
                      +50
                    </StyledButton>
                  </ButtonGroup>
                  <ButtonToolbar>
                    <StyledButton
                      appearance="subtle"
                      onClick={() =>
                        handleGoToButton(rest.activePage - 5 > 1 ? rest.activePage - 5 : 1)
                      }
                    >
                      -5
                    </StyledButton>
                    <StyledButton
                      appearance="subtle"
                      onClick={() =>
                        handleGoToButton(rest.activePage - 15 > 1 ? rest.activePage - 15 : 1)
                      }
                    >
                      -15
                    </StyledButton>
                    <StyledButton
                      appearance="subtle"
                      onClick={() =>
                        handleGoToButton(rest.activePage - 50 > 1 ? rest.activePage - 50 : 1)
                      }
                    >
                      -50
                    </StyledButton>
                  </ButtonToolbar>
                </Popup>
              }
            >
              <StyledIconButton size="sm" appearance="subtle" icon={<Icon icon="caret-right" />} />
            </Whisper>
          )}
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </>
  );
};

export default Paginator;
