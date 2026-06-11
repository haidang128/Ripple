import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

const FAMILY: Record<string, string> = {
  '400':   'Nunito_400Regular',
  'normal':'Nunito_400Regular',
  '600':   'Nunito_600SemiBold',
  '700':   'Nunito_700Bold',
  '800':   'Nunito_800ExtraBold',
  'bold':  'Nunito_700Bold',
};

export default function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style);
  const weight = String(flat?.fontWeight ?? '600');
  const fontFamily = FAMILY[weight] ?? 'Nunito_600SemiBold';
  return <RNText style={[style, { fontFamily }]} {...props} />;
}
