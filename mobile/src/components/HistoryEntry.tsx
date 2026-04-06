import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';
import { formatDate } from '../utils/date';
import type { Log } from '../types';
import SwipeableRow from './SwipeableRow';

interface HistoryEntryProps {
  log: Log;
  isPR: boolean;
  prevLog: Log | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HistoryEntry({ log, isPR, prevLog, onEdit, onDelete }: HistoryEntryProps) {
  const maxKg = Math.max(...log.sets.map((s) => s.kg));
  const prevMaxKg = prevLog ? Math.max(...prevLog.sets.map((s) => s.kg)) : 0;
  const weightDiff = prevLog ? maxKg - prevMaxKg : 0;
  const progressPct = prevMaxKg > 0 ? Math.min((maxKg / (prevMaxKg * 1.5)) * 100, 100) : 0;

  return (
    <View style={styles.cardWrapper}>
      <SwipeableRow onEdit={onEdit} onDelete={onDelete}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{log.exerciseName}</Text>
              {isPR && <Text style={styles.prBadge}>PR</Text>}
            </View>
            <Text style={styles.date}>
              {log.dayName} {'\u00B7'} {formatDate(log.date).toUpperCase()}
            </Text>
          </View>

          <View style={styles.setsRow}>
            {log.sets.map((s, i) => (
              <Text key={i} style={styles.setChip}>
                {s.kg}{s.unit} {'\u00D7'} {s.reps}
              </Text>
            ))}
          </View>

          {prevLog && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progressPct}%`,
                      backgroundColor: weightDiff >= 0 ? colors.up : colors.down,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.diff, { color: weightDiff >= 0 ? colors.up : colors.down }]}>
                {weightDiff >= 0 ? '+' : ''}{weightDiff}{log.sets[0]?.unit || 'kg'}
              </Text>
            </View>
          )}
        </View>
      </SwipeableRow>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  prBadge: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  setsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  setChip: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.text,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  diff: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
