


const moreColors = {
  primary: '#FF3131',
  primaryContrast: '#6F1D1DFF', 
  primaryOpacity: '#FE9393DA', 
  danger: '#B02020FF',
  warning: '#B8B01FFF',
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
    tint: '#FF3131',
    secondary: '#fafafa',
        themeGrey: '#aaaaaa',
    ...moreColors
  },
  dark: {
    text: '#fafafa',
    textSecondary: '#cacaca',
    background: '#1a1a1a',
    tint: '#FF3131',
    secondary: '#222222',
    themeGrey: '#777777',
    ...moreColors
  }
};
