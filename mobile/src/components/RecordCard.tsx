import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';
import { formatDate } from '../utils/date';
import type { PersonalRecord } from '../types';

interface RecordCardProps {
  record: PersonalRecord;
  sessionCount: number;
}

export default function RecordCard({ record, sessionCount }: RecordCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{record.exerciseName}</Text>
        <Text style={styles.sessions}>
          {sessionCount} SESSION{sessionCount !== 1 ? 'S' : ''}
        </Text>
      </View>
      <Text style={styles.value}>
        {record.weight}{record.unit} {'\u00D7'} {record.reps}
      </Text>
      <Text style={styles.date}>SET ON {formatDate(record.date).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sessions: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.accent,
    marginVertical: spacing.xs,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.5,
  },
});
