import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, radii } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  const variantStyles = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        pressed && { opacity: 0.8 },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, variantStyles.text]}>
        {title.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.accent },
    text: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.surface2 },
    text: { color: colors.text },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: colors.white },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    text: { color: colors.muted },
  },
};
