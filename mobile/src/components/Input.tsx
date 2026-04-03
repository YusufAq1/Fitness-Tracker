import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, radii } from '../constants/theme';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'numeric';
}

export default function Input({ variant = 'default', style, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[
        styles.input,
        variant === 'numeric' && styles.numeric,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  numeric: {
    textAlign: 'center',
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});
