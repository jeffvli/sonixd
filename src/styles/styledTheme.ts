export const defaultDark = {
  all: {
    fonts: {
      pageTitleFontSize: '30px',
      pageFontSize: '14px',
      panelHeaderFontSize: '20px',
    },
  },
  primary: {
    main: '#2196F3',
    background: '#181a1f',
    titleBar: '#101010',
    titleText: '#FFFFFF',
    playerBar: '#101010',
    sideBar: '#101010',
    text: '#D8D8D8',
    rowSelected: '#4D5156',
    playerBarText: '#e9ebf0',
    playerBarButtons: 'rgba(240, 240, 240, 0.8)',
    playerBarButtonsHover: '#ffffff',
    inputBackground: '#1A1D24',
    spinner: '#FFFFFF',
    spinnerBackground: 'rgba(233, 235, 240, 0.3)',
    sliderBackground: '#888E94',
    coverArtShadow: '#000000',
  },
  secondary: {
    main: '#292D33',
    text: '#888e94',
    playerBarText: '#888e94',
  },
};

export const defaultLight = {
  all: {
    ...defaultDark.all,
  },
  primary: {
    main: '#285DA0',
    background: '#EBEEF5',
    titleBar: '#272C36',
    titleText: '#FFFFFF',
    playerBar: '#272C36',
    sideBar: '#272C36',
    text: '#000000',
    rowSelected: '#BABCC2',
    playerBarText: '#EBEEF5',
    playerBarButtons: 'rgba(240, 240, 240, 0.8)',
    playerBarButtonsHover: '#FFFFFF',
    inputBackground: '#F4F7FF',
    spinner: '#000000',
    spinnerBackground: 'rgba(0, 0, 0, 0.3)',
    sliderBackground: '#888e94',
    coverArtShadow: '#000000',
  },
  secondary: {
    main: '#292D33',
    text: '#888e94',
    playerBarText: '#888e94',
  },
};
