import { View, Text, Pressable, StyleSheet } from 'react-native';
import Input from './Input';
import { colors, fonts, spacing } from '../constants/theme';

interface SetRowProps {
  index: number;
  kg: string;
  reps: string;
  unit: string;
  onChangeKg: (val: string) => void;
  onChangeReps: (val: string) => void;
  onDelete: () => void;
}

export default function SetRow({ index, kg, reps, unit, onChangeKg, onChangeReps, onDelete }: SetRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.setNum}>{index + 1}</Text>
      <Input
        variant="numeric"
        value={kg}
        onChangeText={onChangeKg}
        keyboardType="decimal-pad"
        placeholder="0"
        style={styles.input}
      />
      <Text style={styles.unit}>{unit.toUpperCase()}</Text>
      <Text style={styles.x}>{'\u00D7'}</Text>
      <Input
        variant="numeric"
        value={reps}
        onChangeText={onChangeReps}
        keyboardType="number-pad"
        placeholder="0"
        style={styles.input}
      />
      <Text style={styles.unit}>REPS</Text>
      <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
        <Text style={styles.deleteIcon}>{'\u2715'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  setNum: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.muted,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    minWidth: 50,
  },
  unit: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  x: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
    color: colors.danger,
  },
});
