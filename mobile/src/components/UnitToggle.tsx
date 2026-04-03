import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';

interface UnitToggleProps {
  unit: 'kg' | 'lbs';
  onToggle: (unit: 'kg' | 'lbs') => void;
}

export default function UnitToggle({ unit, onToggle }: UnitToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.option, unit === 'kg' && styles.active]}
        onPress={() => onToggle('kg')}
      >
        <Text style={[styles.text, unit === 'kg' && styles.activeText]}>KG</Text>
      </Pressable>
      <Pressable
        style={[styles.option, unit === 'lbs' && styles.active]}
        onPress={() => onToggle('lbs')}
      >
        <Text style={[styles.text, unit === 'lbs' && styles.activeText]}>LBS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  active: {
    backgroundColor: colors.accent,
  },
  text: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
  activeText: {
    color: colors.white,
  },
});
