import { css } from 'styled-components';

export enum Font {
  EPILOGUE = 'Epilogue',
  GOTHAM = 'Gotham',
  INTER = 'Inter',
  POPPINS = 'Poppins',
}

export const fontGotham = (weight?: number) => css`
  font-family: 'Gotham';
  font-weight: ${weight || 400};
`;

export const fontPoppins = (weight?: number) => css`
  font-family: 'Poppins';
  font-weight: ${weight || 400};
`;

export const fontInter = (weight?: number) => css`
  font-family: 'Inter';
  font-weight: ${weight || 400};
`;

export const fontEpilogue = (weight?: number) => css`
  font-family: 'Epilogue';
  font-weight: ${weight || 400};
`;
