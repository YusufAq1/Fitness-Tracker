import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActionSheetIOS, Platform, Alert } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';
import type { Day } from '../types';
import ExerciseRow from './ExerciseRow';
import Button from './Button';

interface DayCardProps {
  day: Day;
  onAddExercise: (dayId: string) => void;
  onRenameDay: (dayId: string, currentName: string) => void;
  onDeleteDay: (dayId: string) => void;
  onRenameExercise: (dayId: string, exerciseId: string, currentName: string) => void;
  onDeleteExercise: (dayId: string, exerciseId: string) => void;
  onExercisePress: (dayId: string, exerciseId: string, exerciseName: string, dayName: string) => void;
}

export default function DayCard({
  day,
  onAddExercise,
  onRenameDay,
  onDeleteDay,
  onRenameExercise,
  onDeleteExercise,
  onExercisePress,
}: DayCardProps) {
  const [expanded, setExpanded] = useState(false);

  function handleLongPress() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Rename', 'Delete', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) onRenameDay(day.id, day.name);
          if (index === 1) onDeleteDay(day.id);
        },
      );
    } else {
      Alert.alert(day.name, '', [
        { text: 'Rename', onPress: () => onRenameDay(day.id, day.name) },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteDay(day.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={styles.header}
      >
        <View>
          <Text style={styles.name}>{day.name}</Text>
          <Text style={styles.count}>
            {day.exercises.length} EXERCISE{day.exercises.length !== 1 ? 'S' : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '\u25B4' : '\u25BE'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          {day.exercises.map((ex) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              dayId={day.id}
              dayName={day.name}
              onPress={() => onExercisePress(day.id, ex.id, ex.name, day.name)}
              onRename={() => onRenameExercise(day.id, ex.id, ex.name)}
              onDelete={() => onDeleteExercise(day.id, ex.id)}
            />
          ))}
          <Button
            title="+ Add Exercise"
            variant="outline"
            onPress={() => onAddExercise(day.id)}
            style={styles.addBtn}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: colors.muted,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  addBtn: {
    marginTop: spacing.sm,
  },
});
