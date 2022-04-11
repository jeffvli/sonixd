import i18n from '../../i18n/i18n';

// Fonts files are added in src/fonts
// Font-faces are defined in src/styles/App.global.css

const fonts = [
  'AnekTamil',
  'Archivo',
  'Circular STD',
  'Cormorant',
  'Didact Gothic',
  'DM Sans',
  'Encode Sans',
  'Epilogue',
  'Gotham',
  'Hahmlet',
  'Inconsolata',
  'Inter',
  'JetBrains Mono',
  'Manrope',
  'Montserrat',
  'Oswald',
  'Oxygen',
  'Poppins',
  'Raleway',
  'Roboto',
  'Sora',
  'Spectral',
  'Work Sans',
];

const Fonts = [
  ...fonts.map((font) => {
    return { label: `${font}`, value: `${font}`, role: i18n.t('Regular') };
  }),
];

export default Fonts;
