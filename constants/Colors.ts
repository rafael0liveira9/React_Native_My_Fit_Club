


const moreColors = {
  primary: '#FF3131',
  successContrast: '#1E97320F',
  primaryContrast: '#6F1D1DFF', 
  primaryOpacity: '#FE9393DA', 
  orange : '#FFAE00FF',
  danger: '#B02020FF',
  warning: '#FFD700',
  default: '#ECEDEE',
  success: '#1E9732FF',
  info: '#003984FF',
  white: '#ffffff',
  black: '#000000',
  grey: '#efefef'
}

export const Colors = {
  light: {
    text: '#101010',
    textSecondary: '#333333',
    background: '#ffffff',
    backgroundSecondary: '#F5FFECFF',
    tint: '#FF3131',
    secondary: '#fafafa',
        themeGrey: '#aaaaaa',
    ...moreColors
  },
  dark: {
    text: '#fafafa',
    textSecondary: '#cacaca',
    backgroundSecondary: '#242822FF',
    background: '#000000',
    tint: '#FF3131',
    secondary: '#111111',
    themeGrey: '#777777',
    ...moreColors
  }
};
