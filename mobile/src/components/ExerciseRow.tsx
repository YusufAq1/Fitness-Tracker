import { View, Text, Pressable, StyleSheet, ActionSheetIOS, Platform, Alert } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import type { Exercise } from '../types';
import { useLastLog } from '../hooks/useLastLog';

interface ExerciseRowProps {
  exercise: Exercise;
  dayId: string;
  dayName: string;
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

  function handleLongPress() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Rename', 'Delete', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) onRename();
          if (index === 1) onDelete();
        },
      );
    } else {
      Alert.alert(exercise.name, '', [
        { text: 'Rename', onPress: onRename },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  const lastSummary = lastLog
    ? lastLog.sets.map((s) => `${s.kg}${s.unit} \u00D7 ${s.reps}`).join('  ')
    : null;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{exercise.name}</Text>
        {lastSummary && <Text style={styles.last}>{lastSummary}</Text>}
      </View>
      <Text style={styles.arrow}>{'\u203A'}</Text>
    </Pressable>
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
