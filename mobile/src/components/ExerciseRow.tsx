import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import type { Exercise } from '../types';
import { useLastLog } from '../hooks/useLastLog';
import SwipeableRow from './SwipeableRow';

interface ExerciseRowProps {
  exercise: Exercise;
  onPress: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function ExerciseRow({
  exercise,
  onPress,
  onRename,
  onDelete,
}: ExerciseRowProps) {
  const lastLog = useLastLog(exercise.id);

  const lastSummary = lastLog
    ? lastLog.sets.map((s) => `${s.kg}${s.unit} \u00D7 ${s.reps}`).join('  ')
    : null;

  return (
    <SwipeableRow onEdit={onRename} onDelete={onDelete} editLabel="Rename">
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.info}>
          <Text style={styles.name}>{exercise.name}</Text>
          {lastSummary && <Text style={styles.last}>{lastSummary}</Text>}
        </View>
        <Text style={styles.arrow}>{'\u203A'}</Text>
      </Pressable>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  last: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  arrow: {
    fontSize: 22,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
});
