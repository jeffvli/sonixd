export const defaultDark = {
  label: 'Default Dark',
  value: 'defaultDark',
  fonts: {
    size: {
      page: '14px',
      panelTitle: '20px',
    },
  },
  colors: {
    primary: '#2196F3',
    layout: {
      page: {
        color: '#D8D8D8',
        colorSecondary: '#888e94',
        background: '#181A1F',
      },
      playerBar: {
        color: '#D8D8D8',
        colorSecondary: '#888e94',
        background: 'linear-gradient(0deg, rgba(20,21,24,1) 32%, rgba(25,25,25,1) 100%)',
        button: {
          color: 'rgba(240, 240, 240, 0.8)',
          colorHover: '#FFFFFF',
        },
      },
      sideBar: {
        background: '#101010',
        button: {
          color: '#D8D8D8',
          colorHover: '#FFFFFF',
        },
      },
      titleBar: {
        color: '#FFFFFF',
        background: '#101010',
      },
      miniPlayer: {
        background: '#141518',
      },
    },
    button: {
      default: {
        color: '#D8D8D8',
        colorHover: '#FFFFFF',
        background: '#292D33',
        backgroundHover: '#3C3F43',
      },
      primary: {
        color: '#FFFFFF',
        colorHover: '#FFFFFF',
        backgroundHover: '#3B89EC',
      },
      subtle: {
        color: '#D8D8D8',
        colorHover: '#D8D8D8',
        backgroundHover: 'transparent',
      },
      link: {
        color: '#2196F3',
        colorHover: '#3B89EC',
      },
    },
    card: {
      overlayButton: {
        color: '#FFFFFF',
        background: '#000000',
        opacity: 0.8,
      },
    },
    contextMenu: {
      color: '#D8D8D8',
      colorDisabled: '#6A6F76',
      background: '#151619',
      backgroundHover: '#292D33',
    },
    input: {
      color: '#D8D8D8',
      background: '#25292E',
      backgroundHover: '#353A45',
      backgroundActive: 'rgba(240, 240, 240, .2)',
    },
    nav: {
      color: '#D8D8D8',
    },
    popover: {
      color: '#D8D8D8',
      background: '#151619',
    },
    slider: {
      background: '#3C3F43',
      progressBar: '#888E94',
    },
    spinner: {
      background: 'rgba(233, 235, 240, 0.3)',
      foreground: '#2196F3',
    },
    table: {
      selectedRow: '#4D5156',
    },
    tag: {
      background: '#3C3F43',
      text: '#E2E4E9',
    },
    tooltip: {
      color: '#D8D8D8',
      background: '#151619',
    },
  },
  other: {
    button: {
      borderRadius: '0px',
    },
    coverArtFilter: 'drop-shadow(0px 3px 5px #000000)',
    card: {
      borderRadius: '0px',
    },
    input: {
      borderRadius: '0px',
    },
    miniPlayer: {
      height: '450px',
      opacity: 0.95,
    },
    panel: {
      borderRadius: '0px',
    },
    playerBar: {
      borderTop: '1px solid rgba(240, 240, 240, .15)',
      borderRight: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      filter: 'none',
    },
    tag: {
      borderRadius: '0px',
    },
    tooltip: {
      border: '1px #3c3f43 solid',
      borderRadius: '0px',
    },
  },
};

export const defaultLight = {
  label: 'Default Light',
  value: 'defaultLight',
  type: 'light',
  fonts: {
    size: {
      page: '14px',
      pageTitle: '30px',
      panelTitle: '20px',
    },
  },
  colors: {
    primary: '#285DA0',
    layout: {
      page: {
        color: '#000000',
        colorSecondary: '#4c4c4c',
        background: 'linear-gradient(0deg, rgba(255,255,255,1) 64%, rgba(220,220,220,1) 100%)',
      },
      playerBar: {
        color: '#FFFFFF',
        colorSecondary: '#888e94',
        background: '#212121',
        button: {
          color: 'rgba(240, 240, 240, 0.8)',
          colorHover: '#FFFFFF',
        },
      },
      sideBar: {
        background: '#212121',
        button: {
          color: '#D8D8D8',
          colorHover: '#FFFFFF',
        },
      },
      titleBar: {
        color: '#FFFFFF',
        background: '#212121',
      },
      miniPlayer: {
        background: 'rgba(255,255,255,1)',
      },
    },
    button: {
      default: {
        color: '#575757',
        colorHover: '#000000',
        background: '#DFDFE2',
        backgroundHover: '#D2D2D6',
      },
      primary: {
        color: '#FFFFFF',
        colorHover: '#FFFFFF',
        backgroundHover: '#347AD3',
      },
      subtle: {
        color: '#575757',
        colorHover: '#575757',
        backgroundHover: 'transparent',
      },
      link: {
        color: '#575757',
        colorHover: '#575757',
      },
    },
    card: {
      overlayButton: {
        color: '#FFFFFF',
        colorHover: '#FFFFFF',
        background: '#000000',
        backgroundHover: '#285DA0',
        opacity: 0.8,
      },
    },
    contextMenu: {
      color: '#575757',
      colorDisabled: '#BABABA',
      background: '#FFFFFF',
      backgroundHover: '#D2D2D6',
    },
    input: {
      color: '#000000',
      background: '#FFFFFF',
      backgroundHover: '#E5E5EA',
      backgroundActive: 'rgba(0, 0, 0, .2)',
    },
    nav: {
      color: '#000000',
    },
    popover: {
      color: '#000000',
      background: '#FFFFFF',
    },
    slider: {
      background: '#3C3F43',
      progressBar: '#888E94',
    },
    spinner: {
      background: 'rgba(0, 0, 0, 0.3)',
      foreground: '#285DA0',
    },
    table: {
      selectedRow: 'rgba(150, 150, 150, .5)',
    },
    tag: {
      background: '#DFDFE2',
      text: '#000000',
    },
    tooltip: {
      color: '#000000',
      background: '#FFFFFF',
    },
  },
  other: {
    button: {
      borderRadius: '0px',
    },
    coverArtFilter: 'drop-shadow(0px 3px 5px #000000)',
    card: {
      border: '1px #3c3f43 solid',
      hover: {
        transform: 'scale(1.03)',
        transition: '0.07s ease-in-out',
        filter: 'none',
      },
      image: {
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRadius: '0px',
      },
      info: {
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRadius: '0px',
      },
    },
    input: {
      borderRadius: '0px',
    },
    miniPlayer: {
      height: '450px',
      opacity: 0.95,
    },
    panel: {
      borderRadius: '0px',
    },
    playerBar: {
      borderTop: '1px solid rgba(240, 240, 240, .15)',
      borderRight: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      filter: 'none',
    },
    tag: {
      borderRadius: '0px',
    },
    tooltip: {
      border: '1px #3c3f43 solid',
      borderRadius: '0px',
    },
  },
};
